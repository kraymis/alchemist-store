import { useEffect, useRef, useState } from 'react'
import { Canvas, FabricImage, IText } from 'fabric'
import { Copy, Eye, EyeOff, Layers, Move, Plus, RotateCw, Save, Trash2, Upload, Type } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { tshirtMockups } from '../data/mockups'

const CANVAS = { width: 420, height: 294 }

function clearArtworkClip(object) {
  object.set({ clipPath: undefined })
  object.setCoords()
}

async function createMockupPreview(mockupSource, designState) {
  const output = document.createElement('canvas')
  output.width = CANVAS.width
  output.height = CANVAS.height
  const context = output.getContext('2d')
  const mockupImage = new Image()
  mockupImage.src = mockupSource
  await mockupImage.decode()
  context.drawImage(mockupImage, 0, 0, CANVAS.width, CANVAS.height)

  if (designState) {
    const designCanvas = new Canvas(document.createElement('canvas'), {
      width: CANVAS.width,
      height: CANVAS.height,
      renderOnAddRemove: false,
    })
    await designCanvas.loadFromJSON(designState)
    designCanvas.getObjects().forEach(clearArtworkClip)
    context.drawImage(designCanvas.toCanvasElement(), 0, 0, CANVAS.width, CANVAS.height)
    designCanvas.dispose()
  }
  return output.toDataURL('image/png')
}

function firstDesignSource(state) {
  return state?.objects?.find((item) => item.type === 'image' && item.src)?.src
}

export function CustomizerPage() {
  const { designId } = useParams()
  const canvasElement = useRef(null)
  const canvasRef = useRef(null)
  const fileInput = useRef(null)
  const [side, setSide] = useState('front')
  const [colorId, setColorId] = useState('white')
  const [selected, setSelected] = useState(null)
  const [layers, setLayers] = useState([])
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState('edit')
  const sideStates = useRef({ front: null, back: null })
  const sideRef = useRef(side)
  const { addItem } = useCart()
  const mockup = tshirtMockups.find((item) => item.id === colorId) || tshirtMockups[0]
  useEffect(() => {
    sideRef.current = side
  }, [side])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.selection = mode === 'edit'
    if (mode === 'preview') canvas.discardActiveObject()
    canvas.renderAll()
  }, [mode])

  const refreshLayers = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setLayers([...canvas.getObjects()].reverse())
  }

  useEffect(() => {
    const canvas = new Canvas(canvasElement.current, {
      width: CANVAS.width,
      height: CANVAS.height,
      preserveObjectStacking: true,
      selection: true,
    })
    canvasRef.current = canvas
    canvas.on('selection:created', (event) => setSelected(event.selected?.[0] || null))
    canvas.on('selection:updated', (event) => setSelected(event.selected?.[0] || null))
    canvas.on('selection:cleared', () => setSelected(null))
    canvas.on('object:added', refreshLayers)
    canvas.on('object:removed', refreshLayers)
    const savedDesign = designId
      ? window.localStorage.getItem(`alchemist-design-${designId}`) || window.localStorage.getItem('alchemist-design-saved')
      : window.localStorage.getItem(`alchemist-design-${sideRef.current}`)
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign)
        canvas.loadFromJSON(parsed.canvas).then(() => {
          canvas.getObjects().filter((item) => item.excludeFromExport).forEach((item) => canvas.remove(item))
          canvas.getObjects().filter((item) => !item.excludeFromExport).forEach(clearArtworkClip)
          canvas.renderAll()
          refreshLayers()
        })
      } catch {
        // Ignore invalid local drafts and keep the blank editor usable.
      }
    }
    return () => canvas.dispose()
  }, [designId])

  const addText = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const text = new IText('VOTRE TEXTE', {
      left: CANVAS.width / 2,
      top: CANVAS.height / 2,
      originX: 'center',
      originY: 'center',
      fill: '#26231f',
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: '600',
      charSpacing: 60,
      opacity: .92,
      globalCompositeOperation: 'multiply',
      cornerColor: '#c85f31',
      cornerStyle: 'circle',
      transparentCorners: false,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const uploadDesign = (event) => {
    const file = event.target.files?.[0]
    if (!file || !['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) return
    const reader = new FileReader()
    reader.onload = async () => {
      const image = await FabricImage.fromURL(reader.result)
      image.set({ left: CANVAS.width / 2, top: CANVAS.height / 2, originX: 'center', originY: 'center', cornerColor: '#c85f31', cornerStyle: 'circle', transparentCorners: false, opacity: .9 })
           const ratio = Math.min((CANVAS.width * .5) / image.width, (CANVAS.height * .5) / image.height)
      image.scale(ratio)
      canvasRef.current.add(image)
      canvasRef.current.setActiveObject(image)
      canvasRef.current.renderAll()
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const removeSelected = () => {
    if (!selected || selected.excludeFromExport) return
    canvasRef.current.remove(selected)
    canvasRef.current.discardActiveObject()
    canvasRef.current.renderAll()
  }

  const duplicateSelected = () => {
    if (!selected || selected.excludeFromExport) return
    selected.clone().then((copy) => {
      copy.set({ left: selected.left + 18, top: selected.top + 18 })
      canvasRef.current.add(copy)
      canvasRef.current.setActiveObject(copy)
      canvasRef.current.renderAll()
    })
  }

  const centerSelected = () => {
    if (!selected) return
    selected.set({ left: CANVAS.width / 2, top: CANVAS.height / 2 })
    canvasRef.current.renderAll()
  }

  const bringToFront = () => {
    if (selected) canvasRef.current.bringObjectToFront(selected)
    refreshLayers()
  }

  const sendToBack = () => {
    if (selected) canvasRef.current.sendObjectToBack(selected)
    refreshLayers()
  }

  const saveDesign = () => {
    const canvas = canvasRef.current
    const design = { side, color: mockup.name, canvas: canvas.toJSON(['excludeFromExport']) }
    window.localStorage.setItem(`alchemist-design-${side}`, JSON.stringify(design))
    window.localStorage.setItem('alchemist-design-saved', JSON.stringify(design))
    window.localStorage.setItem('alchemist-design-last', side)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const addToCart = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    sideStates.current[side] = canvas.toJSON(['excludeFromExport'])
    const front = sideStates.current.front
    const back = sideStates.current.back
    const frontPreview = await createMockupPreview(mockup.frontImage, front)
    const backPreview = await createMockupPreview(mockup.backImage, back)
    const customization = {
      productType: 'custom-tshirt',
      color: mockup.name,
      front,
      back,
      frontPreview,
      backPreview,
      frontDesignImage: firstDesignSource(front),
      backDesignImage: firstDesignSource(back),
    }
    addItem({
      id: 'custom-tshirt',
      name: 'T-shirt personnalisé',
      price: 3200,
      sizes: ['M'],
      colors: [mockup.name],
      visual: 'white-tee',
    }, { color: mockup.name, size: 'M', customization })
  }

  const changeSide = (nextSide) => {
    const canvas = canvasRef.current
    if (!canvas || nextSide === side) return
    sideStates.current[side] = canvas.toJSON(['excludeFromExport'])
    const storedState = window.localStorage.getItem(`alchemist-design-${nextSide}`)
    let persistedState = null
    if (storedState) {
      try {
        persistedState = JSON.parse(storedState).canvas
      } catch {
        persistedState = null
      }
    }
    const nextState = sideStates.current[nextSide] || persistedState
    canvas.getObjects().forEach((item) => canvas.remove(item))
    if (nextState) canvas.loadFromJSON(nextState).then(() => {
      canvas.getObjects().filter((item) => item.excludeFromExport).forEach((item) => canvas.remove(item))
      canvas.getObjects().filter((item) => !item.excludeFromExport).forEach(clearArtworkClip)
      canvas.renderAll()
      refreshLayers()
    })
    setSide(nextSide)
    setSelected(null)
  }

  return (
    <section className="customizer-page">
      <div className="customizer-header">
        <div><p className="eyebrow">Studio créatif · The Alchemist Store</p><h1>Personnalisez votre tee.</h1><p>Créez une pièce qui vous ressemble, directement depuis Mostaganem.</p></div>
        <Link to="/shop" className="text-link">Retour à la boutique <span>→</span></Link>
      </div>
      <div className="customizer-workspace">
        <aside className="customizer-tools">
          <p className="editor-label">Outils</p>
          <button type="button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Ajouter un design</button>
          <input ref={fileInput} hidden type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={uploadDesign} />
          <button type="button" onClick={addText}><Type size={16} /> Ajouter du texte</button>
          <div className="layers-panel"><p className="editor-label"><Layers size={14} /> Calques</p>{layers.filter((item) => !item.excludeFromExport).length === 0 && <span className="layer-empty">Aucun élément pour le moment.</span>}{layers.filter((item) => !item.excludeFromExport).map((item, index) => <button type="button" className={selected === item ? 'layer active' : 'layer'} key={item.__uid || index} onClick={() => { canvasRef.current.setActiveObject(item); canvasRef.current.renderAll(); }}>{item.type === 'i-text' ? 'Votre texte' : `Design ${layers.length - index}`}<span onClick={(event) => { event.stopPropagation(); item.set('visible', item.visible === false); canvasRef.current.renderAll(); refreshLayers() }}>{item.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}</span></button>)}</div>
        </aside>
        <div className="customizer-stage">
          <div className="side-switch"><button type="button" className={side === 'front' ? 'active' : ''} onClick={() => changeSide('front')}>Face</button><button type="button" className={side === 'back' ? 'active' : ''} onClick={() => changeSide('back')}>Dos</button></div>
          <div className={`mockup-editor mockup-${side} ${mode === 'preview' ? 'preview-mode' : ''}`}><img className="mockup-photo" src={side === 'front' ? mockup.frontImage : mockup.backImage} alt={`T-shirt ${mockup.name} vue ${side === 'front' ? 'de face' : 'de dos'}`} /><canvas ref={canvasElement} /></div>
          <div className="print-note">Surface du t-shirt · position libre · photo réaliste</div>
          <div className="editor-actions"><div className="mode-switch"><button type="button" className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}>Modifier</button><button type="button" className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>Aperçu</button></div><button type="button" onClick={saveDesign}><Save size={16} /> {saved ? 'Design sauvegardé' : 'Sauvegarder'}</button><button type="button" className="button button-dark" onClick={addToCart}>Ajouter au panier <span>→</span></button></div>
        </div>
        <aside className="customizer-options">
          <p className="editor-label">T-shirt</p><h2>{side === 'front' ? 'Face avant' : 'Dos'}</h2>
          <p className="option-caption">Couleur du t-shirt</p><div className="shirt-swatches">{tshirtMockups.map((item) => <button type="button" key={item.id} title={item.name} aria-label={item.name} className={mockup.id === item.id ? 'selected' : ''} style={{ background: item.color }} onClick={() => setColorId(item.id)} />)}</div>
          <div className="selected-color">{mockup.name} <span className="mockup-status">· mockup réel</span></div>
          {selected && <div className="context-tools"><p className="option-caption">Élément sélectionné</p><div><button type="button" onClick={centerSelected}><Move size={15} /> Centrer</button><button type="button" onClick={duplicateSelected}><Copy size={15} /> Dupliquer</button><button type="button" onClick={bringToFront}><Plus size={15} /> Premier plan</button><button type="button" onClick={sendToBack}><Layers size={15} /> Arrière-plan</button><button type="button" onClick={() => { selected.rotate((selected.angle || 0) + 15); canvasRef.current.renderAll() }}><RotateCw size={15} /> Tourner</button><button type="button" className="danger" onClick={removeSelected}><Trash2 size={15} /> Supprimer</button></div></div>}
          <div className="editor-tip"><span>✦</span><p>PNG, JPG et SVG acceptés. Positionnez votre design librement sur le t-shirt.</p></div>
        </aside>
      </div>
    </section>
  )
}
