import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, FabricImage, IText } from 'fabric'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  ImagePlus,
  Layers3,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  ShoppingBag,
  Trash2,
  Type,
  Upload,
} from 'lucide-react'

import { tshirtMockups } from '../data/mockups'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/useToast'

const CANVAS_WIDTH = 1499
const CANVAS_HEIGHT = 1049

const CUSTOMIZATION_STORAGE_KEY = 'alchemist-customizations'
const DESIGN_STORAGE_PREFIX = 'alchemist-design'

function createCustomizationId() {
  if (window.crypto?.randomUUID) {
    return `custom-${window.crypto.randomUUID()}`
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getStoredDesign(side) {
  try {
    const value = window.localStorage.getItem(
      `${DESIGN_STORAGE_PREFIX}-${side}`,
    )

    if (!value) return null

    const state = JSON.parse(value)
    const hasTemporaryImage = state?.objects?.some(
      (object) => typeof object?.src === 'string' && object.src.startsWith('blob:'),
    )

    if (hasTemporaryImage) {
      window.localStorage.removeItem(`${DESIGN_STORAGE_PREFIX}-${side}`)
      return null
    }

    return state
  } catch {
    return null
  }
}

function saveStoredDesign(side, state) {
  try {
    window.localStorage.setItem(
      `${DESIGN_STORAGE_PREFIX}-${side}`,
      JSON.stringify(state),
    )
  } catch {
    // Ignore localStorage errors.
  }
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

async function fileToPersistentDataUrl(file) {
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Image read failed'))
    reader.readAsDataURL(file)
  })

  if (file.type === 'image/svg+xml') return source

  const image = await FabricImage.fromURL(source)
  const width = image.width || 1
  const height = image.height || 1
  const scale = Math.min(1, 1200 / width, 1200 / height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext('2d')
  if (!context) return source
  context.drawImage(image.getElement(), 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.82)
}

export default function CustomizerPage() {
  const navigate = useNavigate()
  const { addItem } = useContext(CartContext)
  const { notify } = useToast()

  const canvasElement = useRef(null)
  const canvasRef = useRef(null)
  const fileInput = useRef(null)

  const currentSideRef = useRef('front')

  const sideStates = useRef({
    front: null,
    back: null,
  })

  const [side, setSide] = useState('front')
  const [colorId, setColorId] = useState(tshirtMockups[0].id)

  const [selectedObject, setSelectedObject] = useState(null)
  const [layers, setLayers] = useState([])

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

      try {
        const image = await FabricImage.fromURL(imageSource, {
          crossOrigin: 'anonymous',
        })

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
      setSaved(false)
    }

    const handleObjectRemoved = () => {
      refreshLayers()
      setSaved(false)
    }

    const handleObjectModified = () => {
      refreshLayers()
      setSaved(false)
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
    setMockupBackground(
      tshirtMockups[0].frontImage,
    ).then(async () => {
      /*
       * Then load saved artwork.
       */
      if (initialState) {
        await loadArtworkState(initialState)
      }
    })

    return () => {
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
    setSaved(false)

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
        const imageSource = await fileToPersistentDataUrl(file)
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
        setSaved(false)

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

    setSaved(false)

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

      setSaved(false)
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

      setSaved(false)
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

      setSaved(false)
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

      setSaved(false)
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

      if (side !== 'front') {
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

      if (side !== 'back') {
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
      if (originalSide !== side) {
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
          getFirstImageSource(
            frontState,
          ),

        backDesignImage:
          getFirstImageSource(
            backState,
          ),
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
   * Save
   * ---------------------------------------------------------
   */

  const saveDesign = useCallback(async () => {
    setSaving(true)

    try {
      const customization =
        await buildCustomization()

      const existing =
        JSON.parse(
          window.localStorage.getItem(
            CUSTOMIZATION_STORAGE_KEY,
          ) || '[]',
        )

      const list =
        Array.isArray(existing)
          ? existing
          : []

      const compactCustomization = {
        ...customization,
        frontPreview: undefined,
        backPreview: undefined,
      }
      list.push(compactCustomization)

      try {
        window.localStorage.setItem(
          CUSTOMIZATION_STORAGE_KEY,
          JSON.stringify(list.slice(-10)),
        )
      } catch (storageError) {
        console.warn('Customization history could not be persisted.', storageError)
        window.localStorage.removeItem(CUSTOMIZATION_STORAGE_KEY)
        window.localStorage.setItem(
          CUSTOMIZATION_STORAGE_KEY,
          JSON.stringify([compactCustomization]),
        )
      }

      setSaved(true)

      notify(
        'Personnalisation sauvegardée.',
      )

      return customization
    } catch (error) {
      console.error(error)

      notify(
        'Impossible de sauvegarder la personnalisation.',
        'error',
      )

      return null
    } finally {
      setSaving(false)
    }
  }, [
    buildCustomization,
    notify,
  ])

  /*
   * ---------------------------------------------------------
   * Add to cart
   * ---------------------------------------------------------
   */

  const addToCart = useCallback(async () => {
    const customization =
      await saveDesign()

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
    saveDesign,
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
    <main className="customizer-page min-h-screen bg-[#f5f1e8] text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60"
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
              The Alchemist Store
            </p>

            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Custom T-Shirt
            </h1>
          </div>

          <button
            type="button"
            onClick={downloadPreview}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-900/15 bg-white px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 dark:border-white/15 dark:bg-neutral-900"
          >
            <Download size={17} />
            Exporter
          </button>
        </header>

        {/* MAIN */}
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_300px]">

          {/* LEFT PANEL */}
          <aside className="order-2 rounded-[28px] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900 lg:order-1">

            <div className="space-y-7">

              {/* COLORS */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Couleur
                  </h2>

                  <span className="text-xs font-medium text-neutral-500">
                    {mockup.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">

                  {tshirtMockups.map(
                    (item) => {
                      const active =
                        item.id === colorId

                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={`T-shirt ${item.name}`}
                          onClick={() =>
                            setColorId(
                              item.id,
                            )
                          }
                          className={[
                            'relative h-11 w-11 rounded-full border-2 transition',
                            active
                              ? 'scale-110 border-neutral-950 ring-2 ring-neutral-950/20 dark:border-white dark:ring-white/20'
                              : 'border-neutral-300 hover:scale-105 dark:border-neutral-700',
                          ].join(' ')}
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        >
                          {item.id ===
                            'white' && (
                            <span className="absolute inset-1 rounded-full border border-black/10" />
                          )}
                        </button>
                      )
                    },
                  )}

                </div>
              </section>

              {/* SIDE */}
              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-wider">
                  Face
                </h2>

                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">

                  <button
                    type="button"
                    onClick={() =>
                      changeSide('front')
                    }
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-bold transition',
                      side === 'front'
                        ? 'bg-white shadow-sm dark:bg-neutral-950'
                        : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white',
                    ].join(' ')}
                  >
                    Devant
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeSide('back')
                    }
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-bold transition',
                      side === 'back'
                        ? 'bg-white shadow-sm dark:bg-neutral-950'
                        : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white',
                    ].join(' ')}
                  >
                    Dos
                  </button>

                </div>
              </section>

              {/* ADD */}
              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-wider">
                  Ajouter
                </h2>

                <div className="space-y-2">

                  <button
                    type="button"
                    onClick={addText}
                    className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    <Type size={18} />
                    Ajouter du texte
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fileInput.current?.click()
                    }
                    className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    <ImagePlus size={18} />
                    Ajouter une image
                  </button>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={
                      uploadDesign
                    }
                  />

                </div>
              </section>

              {/* HELP */}
              <section className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">

                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Conseil
                </p>

                <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  Place ton design directement
                  sur le T-shirt comme tu
                  souhaites qu’il soit imprimé.
                  Il n’y a volontairement aucune
                  limite de placement.
                </p>

              </section>

            </div>
          </aside>

          {/* CANVAS */}
          <section className="order-1 min-w-0 lg:order-2">

            <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">

              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                    {side === 'front'
                      ? 'Front'
                      : 'Back'}
                  </p>

                  <p className="text-sm font-bold">
                    T-shirt {mockup.name}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      scaleSelected(-0.05)
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Réduire"
                  >
                    <Minus size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      scaleSelected(0.05)
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Agrandir"
                  >
                    <Plus size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      rotateSelected(-15)
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Tourner à gauche"
                  >
                    <RotateCcw size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      rotateSelected(15)
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Tourner à droite"
                  >
                    <RotateCw size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      moveLayer('down')
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Descendre"
                  >
                    <ChevronDown size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={() =>
                      moveLayer('up')
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                    title="Monter"
                  >
                    <ChevronUp size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedObject
                    }
                    onClick={
                      deleteSelected
                    }
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                    title="Supprimer"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              </div>

              {/* CANVAS */}
              <div className="flex w-full justify-center overflow-auto bg-[#e9e4d9] p-3 sm:p-6 dark:bg-neutral-800">

                <div className="w-full max-w-[1100px]">

                  <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-950">

                    <canvas
                      ref={canvasElement}
                      className="block h-auto w-full"
                    />

                  </div>

                </div>

              </div>

              {/* INFO */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-3 dark:border-white/10">

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Design libre
                </div>

                <div className="text-xs font-medium text-neutral-500">
                  Fais glisser, redimensionne ou
                  tourne ton design.
                </div>

              </div>

            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="order-3 rounded-[28px] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">

            <div className="space-y-6">

              {/* SELECTED */}
              <section>

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Élément sélectionné
                  </h2>

                  <Layers3
                    size={17}
                    className="text-neutral-400"
                  />

                </div>

                {selectedObject ? (
                  <div className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">

                    <p className="text-sm font-bold">
                      {selectedObject.type ===
                      'i-text'
                        ? 'Texte'
                        : selectedObject.type ===
                            'image'
                          ? 'Image'
                          : 'Élément'}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Sélectionné
                    </p>

                    <button
                      type="button"
                      onClick={
                        deleteSelected
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>

                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/10 p-4 text-sm leading-6 text-neutral-500 dark:border-white/10">
                    Sélectionne un texte ou une
                    image pour modifier sa taille,
                    sa rotation ou sa position.
                  </div>
                )}

              </section>

              {/* LAYERS */}
              <section>

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Calques
                  </h2>

                  <span className="text-xs font-bold text-neutral-400">
                    {layers.length}
                  </span>

                </div>

                {layers.length > 0 ? (
                  <div className="space-y-2">

                    {layers.map(
                      (layer, index) => {
                        const active =
                          layer ===
                          selectedObject

                        return (
                          <button
                            key={`${layer.type}-${index}`}
                            type="button"
                            onClick={() => {
                              const canvas =
                                canvasRef.current

                              if (!canvas)
                                return

                              canvas.setActiveObject(
                                layer,
                              )

                              canvas.requestRenderAll()

                              setSelectedObject(
                                layer,
                              )
                            }}
                            className={[
                              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                              active
                                ? 'bg-neutral-950 font-bold text-white dark:bg-white dark:text-neutral-950'
                                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                            ].join(' ')}
                          >
                            <Layers3
                              size={15}
                            />

                            <span>
                              {layer.type ===
                              'i-text'
                                ? 'Texte'
                                : layer.type ===
                                    'image'
                                  ? 'Image'
                                  : layer.type}
                            </span>
                          </button>
                        )
                      },
                    )}

                  </div>
                ) : (
                  <p className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-500 dark:bg-neutral-800">
                    Aucun élément ajouté.
                  </p>
                )}

              </section>

              {/* PRICE */}
              <section className="border-t border-black/10 pt-5 dark:border-white/10">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Prix
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      3 200 DA
                    </p>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold dark:bg-neutral-800">
                    Taille M
                  </span>

                </div>

              </section>

              {/* ACTIONS */}
              <section className="space-y-2">

                <button
                  type="button"
                  disabled={saving}
                  onClick={saveDesign}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm font-black transition hover:-translate-y-0.5 hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                >
                  <Save size={18} />

                  {saving
                    ? 'Sauvegarde...'
                    : saved
                      ? 'Personnalisation sauvegardée'
                      : 'Sauvegarder'}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={addToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  <ShoppingBag size={18} />

                  Ajouter au panier —
                  3 200 DA
                </button>

              </section>

              {/* INFO */}
              <section className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">

                <div className="flex items-start gap-3">

                  <Upload
                    size={17}
                    className="mt-0.5 shrink-0 text-neutral-500"
                  />

                  <div>

                    <p className="text-sm font-bold">
                      Ton design
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      PNG, JPG, WEBP ou SVG.
                      Tu peux déplacer, agrandir,
                      réduire et faire pivoter ton
                      design librement sur le
                      T-shirt.
                    </p>

                  </div>

                </div>

              </section>

            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
