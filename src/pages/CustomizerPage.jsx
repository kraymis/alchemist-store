import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, FabricImage, IText } from 'fabric'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Layers3,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Trash2,
  Type,
  Upload,
} from 'lucide-react'

import { tshirtMockups } from '../data/mockups'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/useToast'
import { api, assetUrl } from '../lib/api'

const CANVAS_WIDTH = 1499
const CANVAS_HEIGHT = 1049

function createCustomizationId() {
  if (window.crypto?.randomUUID) {
    return `custom-${window.crypto.randomUUID()}`
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getStoredDesign(_side) {
  return null
}

function saveStoredDesign(_side, _state) {
  return undefined
}

function getFirstImageSource(state) {
  if (!state?.objects) return null

  const image = state.objects.find(
    (object) =>
      object?.type === 'image' &&
      typeof object?.src === 'string' &&
      object.src.length > 0,
  )

  return image?.src || null
}

function dataUrlToBlob(dataUrl) {
  const [header, encoded] = dataUrl.split(',')
  const mime = header.match(/data:([^;]+)/)?.[1] || 'image/webp'
  const binary = atob(encoded)
  return new Blob([Uint8Array.from(binary, (character) => character.charCodeAt(0))], { type: mime })
}

export default function CustomizerPage() {
  const navigate = useNavigate()
  const { addItem } = useContext(CartContext)
  const { notify } = useToast()

  const canvasElement = useRef(null)
  const canvasRef = useRef(null)
  const fileInput = useRef(null)

  const currentSideRef = useRef('front')
  const mockupRequestRef = useRef(0)

  const sideStates = useRef({
    front: null,
    back: null,
  })

  const [side, setSide] = useState('front')
  const [colorId, setColorId] = useState(tshirtMockups[0].id)

  const [selectedObject, setSelectedObject] = useState(null)
  const [layers, setLayers] = useState([])

  const [saving, setSaving] = useState(false)
  const uploadedFiles = useRef({ front: null, back: null })

  const mockup =
    tshirtMockups.find((item) => item.id === colorId) ||
    tshirtMockups[0]

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const refreshLayers = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const objects = canvas
      .getObjects()
      .filter((object) => !object.isMockup)

    setLayers([...objects].reverse())
  }, [])

  /*
   * Save only the artwork.
   *
   * The mockup is NOT stored in the JSON because the selected
   * mockup can change independently from the design.
   */
  const serializeCurrentCanvas = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas) return null

    return canvas.toJSON([
      'isMockup',
    ])
  }, [])

  const saveCurrentSide = useCallback(() => {
    const state = serializeCurrentCanvas()

    if (!state) return null

    sideStates.current[currentSideRef.current] = state

    saveStoredDesign(currentSideRef.current, state)

    return state
  }, [serializeCurrentCanvas])

  /*
   * ---------------------------------------------------------
   * Mockup
   * ---------------------------------------------------------
   */

  const setMockupBackground = useCallback(
    async (imageSource) => {
      const canvas = canvasRef.current

      if (!canvas) return

      const requestId = mockupRequestRef.current + 1
      mockupRequestRef.current = requestId

      try {
        const image = await FabricImage.fromURL(imageSource, {
          crossOrigin: 'anonymous',
        })

        if (canvasRef.current !== canvas || mockupRequestRef.current !== requestId) {
          return
        }

        /*
         * The mockup occupies the entire internal canvas.
         *
         * This means:
         *
         * Canvas coordinate
         *        =
         * Mockup coordinate
         *
         * There is no second <img> with another CSS coordinate
         * system.
         */
        image.set({
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          selectable: false,
          evented: false,
          isMockup: true,
        })

        /*
         * Keep the canvas resolution fixed.
         * The visual size on screen can change responsively,
         * but the internal coordinates remain identical.
         */
        image.scaleToWidth(CANVAS_WIDTH)
        image.scaleToHeight(CANVAS_HEIGHT)

        canvas.backgroundImage = image

        canvas.requestRenderAll()
      } catch (error) {
        console.error('Unable to load T-shirt mockup:', error)

        notify(
          'Impossible de charger le mockup du T-shirt.',
          'error',
        )
      }
    },
    [notify],
  )

  /*
   * ---------------------------------------------------------
   * Load artwork
   * ---------------------------------------------------------
   */

  const loadArtworkState = useCallback(
    async (state) => {
      const canvas = canvasRef.current

      if (!canvas) return

      canvas.discardActiveObject()

      /*
       * Remove only artwork.
       * The mockup is the background and stays untouched.
       */
      const objects = [...canvas.getObjects()]

      objects.forEach((object) => {
        if (!object.isMockup) {
          canvas.remove(object)
        }
      })

      if (state?.objects?.length) {
        /*
         * loadFromJSON loads objects back into the canvas.
         * Since the saved JSON contains only artwork, the
         * background mockup remains intact.
         */
        await canvas.loadFromJSON(state)
      }

      canvas.requestRenderAll()

      refreshLayers()
      setSelectedObject(null)
    },
    [refreshLayers],
  )

  /*
   * ---------------------------------------------------------
   * Export
   * ---------------------------------------------------------
   *
   * The important part:
   *
   * The preview is generated from THE SAME CANVAS that the
   * user sees.
   *
   * There is no second canvas and no coordinate recalculation.
   */

  const exportCurrentCanvas = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas) return ''

    canvas.discardActiveObject()
    canvas.requestRenderAll()

    return canvas.toDataURL({
      format: 'webp',
      multiplier: 0.75,
      quality: 0.82,
    })
  }, [])

  /*
   * ---------------------------------------------------------
   * Initialize Fabric
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!canvasElement.current) return

    const canvas = new Canvas(canvasElement.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,

      preserveObjectStacking: true,
      selection: true,
      renderOnAddRemove: true,

      /*
       * Do not allow Fabric to introduce another visual
       * coordinate system.
       */
      uniformScaling: true,
    })

    canvasRef.current = canvas
    currentSideRef.current = 'front'

    const handleSelectionCreated = (event) => {
      const object = event.selected?.[0] || null

      setSelectedObject(object)
    }

    const handleSelectionUpdated = (event) => {
      const object = event.selected?.[0] || null

      setSelectedObject(object)
    }

    const handleSelectionCleared = () => {
      setSelectedObject(null)
    }

    const handleObjectAdded = () => {
      refreshLayers()
    }

    const handleObjectRemoved = () => {
      refreshLayers()
    }

    const handleObjectModified = () => {
      refreshLayers()
    }

    canvas.on(
      'selection:created',
      handleSelectionCreated,
    )

    canvas.on(
      'selection:updated',
      handleSelectionUpdated,
    )

    canvas.on(
      'selection:cleared',
      handleSelectionCleared,
    )

    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:removed', handleObjectRemoved)
    canvas.on('object:modified', handleObjectModified)

    const initialState =
      sideStates.current.front ||
      getStoredDesign('front')

    sideStates.current.front = initialState

    /*
     * Load the mockup first.
     */
    setMockupBackground(tshirtMockups[0].frontImage).then(async () => {
      if (canvasRef.current !== canvas) return

      /*
       * Then load saved artwork.
       */
      if (initialState) {
        await loadArtworkState(initialState)
      }
    })

    return () => {
      mockupRequestRef.current += 1
      canvas.dispose()
      canvasRef.current = null
    }
  }, [
    loadArtworkState,
    refreshLayers,
    setMockupBackground,
  ])

  /*
   * ---------------------------------------------------------
   * Change mockup color
   * ---------------------------------------------------------
   *
   * The artwork is NOT modified.
   * Only the background changes.
   */

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const imageSource =
      side === 'front'
        ? mockup.frontImage
        : mockup.backImage

    setMockupBackground(imageSource)
  }, [
    mockup,
    side,
    setMockupBackground,
  ])

  /*
   * Keep current side reference synchronized.
   */

  useEffect(() => {
    currentSideRef.current = side
  }, [side])

  /*
   * ---------------------------------------------------------
   * Add text
   * ---------------------------------------------------------
   */

  const addText = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const text = new IText('Votre texte', {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,

      originX: 'center',
      originY: 'center',

      fontFamily: 'Arial',
      fontSize: 90,
      fontWeight: '700',

      fill:
        mockup.id === 'white'
          ? '#111111'
          : '#ffffff',

      editable: true,

      padding: 10,

      cornerStyle: 'circle',
      transparentCorners: false,

      borderColor: '#111111',
      cornerColor: '#111111',

      objectCaching: false,
    })

    canvas.add(text)

    canvas.setActiveObject(text)

    canvas.requestRenderAll()

    refreshLayers()

    setSelectedObject(text)

    /*
     * Immediately allow the user to type.
     */
    text.enterEditing()
    text.selectAll()
  }, [
    mockup.id,
    refreshLayers,
  ])

  /*
   * ---------------------------------------------------------
   * Upload design
   * ---------------------------------------------------------
   */

  const uploadDesign = useCallback(
    async (event) => {
      const file = event.target.files?.[0]

      if (!file) return

      const canvas = canvasRef.current

      if (!canvas) return

      if (!file.type.startsWith('image/')) {
        notify(
          'Veuillez sélectionner une image.',
          'error',
        )

        return
      }

      try {
        const form = new FormData()
        form.append('files', file)
        form.append('roles', `${currentSideRef.current}-design`)
        const uploaded = await api('/customizations/upload', { method: 'POST', body: form })
        const metadata = uploaded.files?.[0]
        if (!metadata?.url) throw new Error('Upload failed')
        uploadedFiles.current[currentSideRef.current] = metadata
        const imageSource = assetUrl(metadata.url)
        const image = await FabricImage.fromURL(imageSource, {
          crossOrigin: 'anonymous',
        })

        const maxWidth = 560
        const maxHeight = 560

        const width = image.width || 1
        const height = image.height || 1

        const scale = Math.min(
          maxWidth / width,
          maxHeight / height,
          1,
        )

        image.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,

          originX: 'center',
          originY: 'center',

          cornerStyle: 'circle',
          transparentCorners: false,

          borderColor: '#111111',
          cornerColor: '#111111',

          padding: 8,

          objectCaching: false,
        })

        image.scale(scale)

        canvas.add(image)
        canvas.setActiveObject(image)

        canvas.requestRenderAll()

        refreshLayers()

        setSelectedObject(image)

        notify('Design ajouté au T-shirt.')
      } catch (error) {
        console.error(error)

        notify(
          'Impossible de charger cette image.',
          'error',
        )
      } finally {
        /*
         * Allows the same image to be selected again.
         */
        event.target.value = ''
      }
    },
    [
      notify,
      refreshLayers,
    ],
  )

  /*
   * ---------------------------------------------------------
   * Delete
   * ---------------------------------------------------------
   */

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas || !selectedObject) return

    if (selectedObject.isMockup) return

    canvas.remove(selectedObject)

    canvas.discardActiveObject()

    setSelectedObject(null)

    refreshLayers()


    canvas.requestRenderAll()
  }, [
    refreshLayers,
    selectedObject,
  ])

  /*
   * ---------------------------------------------------------
   * Layer controls
   * ---------------------------------------------------------
   */

  const moveLayer = useCallback(
    (direction) => {
      const canvas = canvasRef.current

      if (!canvas || !selectedObject) return

      if (selectedObject.isMockup) return

      if (direction === 'up') {
        canvas.bringObjectToFront(
          selectedObject,
        )
      } else {
        /*
         * Send to back of artwork.
         *
         * The mockup is a background so it is not affected.
         */
        canvas.sendObjectBack(selectedObject)
      }

      canvas.requestRenderAll()

      refreshLayers()

    },
    [
      refreshLayers,
      selectedObject,
    ],
  )

  /*
   * ---------------------------------------------------------
   * Rotate
   * ---------------------------------------------------------
   */

  const rotateSelected = useCallback(
    (amount) => {
      const canvas = canvasRef.current

      if (!canvas || !selectedObject) return

      if (selectedObject.isMockup) return

      const currentAngle =
        selectedObject.angle || 0

      selectedObject.rotate(
        currentAngle + amount,
      )

      selectedObject.setCoords()

      canvas.requestRenderAll()

    },
    [selectedObject],
  )

  /*
   * ---------------------------------------------------------
   * Scale
   * ---------------------------------------------------------
   */

  const scaleSelected = useCallback(
    (amount) => {
      const canvas = canvasRef.current

      if (!canvas || !selectedObject) return

      if (selectedObject.isMockup) return

      const currentScale =
        selectedObject.scaleX || 1

      const nextScale = Math.max(
        0.05,
        Math.min(
          10,
          currentScale + amount,
        ),
      )

      selectedObject.scale(nextScale)

      selectedObject.setCoords()

      canvas.requestRenderAll()

    },
    [selectedObject],
  )

  /*
   * ---------------------------------------------------------
   * Change FRONT / BACK
   * ---------------------------------------------------------
   */

  const changeSide = useCallback(
    async (nextSide) => {
      if (nextSide === side) return

      /*
       * Save current artwork first.
       */
      const currentState =
        saveCurrentSide()

      if (currentState) {
        sideStates.current[side] =
          currentState
      }

      /*
       * Retrieve the next side.
       */
      const nextState =
        sideStates.current[nextSide] ||
        getStoredDesign(nextSide)

      sideStates.current[nextSide] =
        nextState

      currentSideRef.current =
        nextSide

      setSide(nextSide)

      /*
       * Load the next side artwork.
       */
      await loadArtworkState(
        nextState,
      )

    },
    [
      loadArtworkState,
      saveCurrentSide,
      side,
    ],
  )

  /*
   * ---------------------------------------------------------
   * Build complete customization
   * ---------------------------------------------------------
   *
   * We temporarily switch to each side, export the actual
   * canvas, then restore the side the user was viewing.
   */

  const buildCustomization =
    useCallback(async () => {
      const originalSide = side

      /*
       * Save current side.
       */
      const currentState =
        saveCurrentSide()

      if (currentState) {
        sideStates.current[side] =
          currentState
      }

      /*
       * -------------------------
       * FRONT
       * -------------------------
       */

      if (currentSideRef.current !== 'front') {
        const frontState =
          sideStates.current.front ||
          getStoredDesign('front')

        await changeSide('front')

        if (frontState) {
          await loadArtworkState(
            frontState,
          )
        }
      }

      const frontState =
        sideStates.current.front ||
        serializeCurrentCanvas() || {
          version: '6.0.0',
          objects: [],
        }

      sideStates.current.front =
        frontState

      const frontPreview =
        exportCurrentCanvas()

      /*
       * -------------------------
       * BACK
       * -------------------------
       */

      if (currentSideRef.current !== 'back') {
        const backState =
          sideStates.current.back ||
          getStoredDesign('back')

        await changeSide('back')

        if (backState) {
          await loadArtworkState(
            backState,
          )
        }
      }

      const backState =
        sideStates.current.back ||
        serializeCurrentCanvas() || {
          version: '6.0.0',
          objects: [],
        }

      sideStates.current.back =
        backState

      const backPreview =
        exportCurrentCanvas()

      /*
       * Restore original side.
       */
      if (currentSideRef.current !== originalSide) {
        await changeSide(
          originalSide,
        )
      }

      return {
        id: createCustomizationId(),

        createdAt:
          new Date().toISOString(),

        productType:
          'custom-tshirt',

        color: mockup.name,

        front: frontState,
        back: backState,

        frontPreview,
        backPreview,

        frontDesignImage:
          uploadedFiles.current.front?.url || getFirstImageSource(frontState),

        backDesignImage:
          uploadedFiles.current.back?.url || getFirstImageSource(backState),

        designFiles: [
          uploadedFiles.current.front,
          uploadedFiles.current.back,
        ].filter(Boolean),
      }
    }, [
      changeSide,
      exportCurrentCanvas,
      loadArtworkState,
      mockup.name,
      saveCurrentSide,
      serializeCurrentCanvas,
      side,
    ])

  /*
   * ---------------------------------------------------------
   * Persist when adding to cart
   * ---------------------------------------------------------
   */

  const persistCustomization = useCallback(async () => {
    setSaving(true)

    try {
      const customization = await buildCustomization()
      const form = new FormData()
      form.append('files', dataUrlToBlob(customization.frontPreview), 'front-preview.webp')
      form.append('files', dataUrlToBlob(customization.backPreview), 'back-preview.webp')
      form.append('roles', 'front-preview')
      form.append('roles', 'back-preview')
      const uploaded = await api('/customizations/upload', { method: 'POST', body: form })
      const previews = uploaded.files || []
      return {
        ...customization,
        frontPreview: assetUrl(previews.find((file) => file.role === 'front-preview')?.url),
        backPreview: assetUrl(previews.find((file) => file.role === 'back-preview')?.url),
      }
    } catch (error) {
      console.error(error)

      notify(
        'Impossible de préparer la personnalisation.',
        'error',
      )

      return null
    } finally {
      setSaving(false)
    }
  }, [buildCustomization, notify])

  /*
   * ---------------------------------------------------------
   * Add to cart
   * ---------------------------------------------------------
   */

  const addToCart = useCallback(async () => {
    const customization = await persistCustomization()

    if (!customization) return

    addItem(
      {
        id: 'custom-tshirt',

        name:
          'T-shirt personnalisé',

        price: 3200,

        sizes: ['M'],

        colors: [mockup.name],

        visual: 'white-tee',
      },
      {
        color: mockup.name,

        size: 'M',

        image:
          customization.frontPreview,

        customization,
      },
    )

    notify(
      'T-shirt personnalisé ajouté au panier !',
    )

    navigate('/cart')
  }, [
    addItem,
    mockup.name,
    navigate,
    notify,
    persistCustomization,
  ])

  /*
   * ---------------------------------------------------------
   * Download current preview
   * ---------------------------------------------------------
   */

  const downloadPreview =
    useCallback(() => {
      const preview =
        exportCurrentCanvas()

      if (!preview) return

      const link =
        document.createElement('a')

      link.href = preview

      link.download =
        `alchemist-${side}-tshirt.png`

      document.body.appendChild(link)

      link.click()

      link.remove()
    }, [
      exportCurrentCanvas,
      side,
    ])

  const hasSelectedObject =
    Boolean(selectedObject)

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <main className="customizer-page">
      <div className="customizer-shell">
        <header className="customizer-intro">
          <div>
            <button type="button" onClick={() => navigate(-1)} className="customizer-back">
              <ArrowLeft size={16} /> Retour
            </button>
            <p className="customizer-kicker">The Alchemist Store / Studio</p>
            <h1>Customize your T-shirt</h1>
            <p className="customizer-description">
              Créez votre pièce. Choisissez la couleur, ajoutez une image ou un texte,
              puis placez votre design exactement où vous le souhaitez.
            </p>
          </div>
          <div className="customizer-intro-meta">
            <span>Home / Customize</span>
            <button type="button" onClick={downloadPreview} className="customizer-export">
              <Download size={16} /> Exporter
            </button>
          </div>
        </header>

        <div className="customizer-editor">
          <section className="customizer-preview-panel">
            <div className="preview-panel-head">
              <div>
                <span className="panel-eyebrow">Preview / 01</span>
                <h2>T-shirt {mockup.name}</h2>
              </div>
              <span className="preview-status"><span /> Design libre</span>
            </div>

            <div className="preview-switcher" role="tablist" aria-label="Face du t-shirt">
              <button type="button" role="tab" aria-selected={side === 'front'} className={side === 'front' ? 'active' : ''} onClick={() => changeSide('front')}>
                Devant
              </button>
              <button type="button" role="tab" aria-selected={side === 'back'} className={side === 'back' ? 'active' : ''} onClick={() => changeSide('back')}>
                Dos
              </button>
            </div>

            <div className="customizer-canvas-stage">
              <div className="customizer-canvas-frame">
                <canvas ref={canvasElement} className="customizer-canvas" />
              </div>
            </div>

            <div className="preview-footer">
              <span>Glissez, redimensionnez ou faites pivoter votre design.</span>
              <span>{side === 'front' ? 'FRONT' : 'BACK'} / {mockup.name.toUpperCase()}</span>
            </div>
          </section>

          <aside className="customizer-sidebar">
            <div className="sidebar-heading">
              <span className="panel-eyebrow">Studio controls</span>
              <h2>Customization</h2>
            </div>

            <section className="editor-section">
              <div className="section-title"><span className="section-number">01</span><h3>Product</h3></div>
              <div className="control-label-row"><span>Color</span><strong>{mockup.name}</strong></div>
              <div className="color-swatches">
                {tshirtMockups.map((item) => (
                  <button key={item.id} type="button" aria-label={`T-shirt ${item.name}`} aria-pressed={item.id === colorId} className={item.id === colorId ? 'selected' : ''} onClick={() => setColorId(item.id)} style={{ backgroundColor: item.color }}>
                    {item.id === 'white' && <span />}
                  </button>
                ))}
              </div>
            </section>

            <section className="editor-section">
              <div className="section-title"><span className="section-number">02</span><h3>Design</h3></div>
              <div className="design-actions">
                <button type="button" onClick={addText}><span className="action-icon"><Type size={18} /></span><span><strong>Add text</strong><small>Write a custom message</small></span><Plus size={16} /></button>
                <button type="button" onClick={() => fileInput.current?.click()}><span className="action-icon"><Upload size={18} /></span><span><strong>Upload image</strong><small>PNG, JPG, WEBP or SVG</small></span><Plus size={16} /></button>
                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={uploadDesign} />
              </div>
            </section>

            <section className="editor-section">
              <div className="section-title"><span className="section-number">03</span><h3>Selected element</h3><span className="section-count">{hasSelectedObject ? '01' : '00'}</span></div>
              {selectedObject ? (
                <div className="selected-element">
                  <div><strong>{selectedObject.type === 'i-text' ? 'Text layer' : selectedObject.type === 'image' ? 'Image layer' : 'Design layer'}</strong><small>Active on {side}</small></div>
                  <button type="button" onClick={deleteSelected} aria-label="Delete selected element"><Trash2 size={17} /></button>
                </div>
              ) : (
                <div className="empty-element"><Layers3 size={17} /><span>Select an element on the preview to edit it.</span></div>
              )}
              <div className="object-toolbar">
                <button type="button" disabled={!hasSelectedObject} onClick={() => scaleSelected(-0.05)} title="Réduire"><Minus size={17} /><span>Smaller</span></button>
                <button type="button" disabled={!hasSelectedObject} onClick={() => scaleSelected(0.05)} title="Agrandir"><Plus size={17} /><span>Larger</span></button>
                <button type="button" disabled={!hasSelectedObject} onClick={() => rotateSelected(-15)} title="Tourner à gauche"><RotateCcw size={17} /><span>Rotate</span></button>
                <button type="button" disabled={!hasSelectedObject} onClick={() => rotateSelected(15)} title="Tourner à droite"><RotateCw size={17} /><span>Turn</span></button>
                <button type="button" disabled={!hasSelectedObject} onClick={() => moveLayer('down')} title="Descendre"><ChevronDown size={17} /><span>Down</span></button>
                <button type="button" disabled={!hasSelectedObject} onClick={() => moveLayer('up')} title="Monter"><ChevronUp size={17} /><span>Up</span></button>
              </div>
            </section>

            <section className="editor-section layers-section">
              <div className="section-title"><span className="section-number">04</span><h3>Layers</h3><span className="section-count">{String(layers.length).padStart(2, '0')}</span></div>
              {layers.length > 0 ? (
                <div className="layer-list">
                  {layers.map((layer, index) => {
                    const active = layer === selectedObject
                    return <button key={`${layer.type}-${index}`} type="button" className={active ? 'active' : ''} onClick={() => { const canvas = canvasRef.current; if (!canvas) return; canvas.setActiveObject(layer); canvas.requestRenderAll(); setSelectedObject(layer) }}><Layers3 size={15} /><span>{layer.type === 'i-text' ? 'Text' : layer.type === 'image' ? 'Image' : layer.type}</span><span className="layer-index">{String(layers.length - index).padStart(2, '0')}</span></button>
                  })}
                </div>
              ) : <p className="empty-layers">Your added elements will appear here.</p>}
            </section>

            <div className="sidebar-bottom">
              <div className="price-row"><div><span>Custom piece</span><strong>3 200 DA</strong></div><span className="size-badge">Size M</span></div>
              <button type="button" disabled={saving} onClick={addToCart} className="cart-button"><ShoppingBag size={18} />Ajouter au panier <span>3 200 DA</span></button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
