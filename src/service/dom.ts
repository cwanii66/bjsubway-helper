// dom related service

export function delLogo() {
  const parentElement = document.getElementById('app')
  const firstChildElement = parentElement!.firstChild
  firstChildElement?.remove()
}

export const zoomControl = new BMapSub.ZoomControl({
  anchor: BMAPSUB_ANCHOR_BOTTOM_RIGHT,
  offset: new BMapSub.Size(10, 100),
})

function createFloatPanel() {
  const parentElement = document.getElementById('app')
  const floatPanelElement = document.createElement('div')
  createTextEl(floatPanelElement, {
    text: '⏂ 北京地铁-线路查询',
    style: `
      color: #fff;
      font-size: 0.9rem;
      font-weight: bold;
      text-align: center;
      margin-top: 0.5rem;
    `,
  })
  floatPanelElement.setAttribute('id', 'float-panel')
  floatPanelElement.setAttribute(
    'style',
    `
      position: absolute;
      top: 3rem;
      left: 3rem;
      z-index: 999;
      width: 12rem;
      height: 9.3rem;
      padding: 0 1rem;
      background-color: #3698CD;
      border-radius: 0.36rem;
    `,
  )
  parentElement?.appendChild(floatPanelElement)
  return floatPanelElement
}

function createTextEl(el: HTMLElement, opts: { text: string; style: string }) {
  const textElement = document.createElement('p')
  textElement.innerText = opts.text
  textElement.setAttribute(
    'style',
    opts.style,
  )
  el.appendChild(textElement)
}

function injectFormToEl(el: HTMLElement) {
  const formElement = setFormEl(el, {
    style: `
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      justify-content: center;
      align-items: center;
      
      width: 100%;
      height: 75%;
    `,
  })
  setInputEl(formElement, {
    placeholder: '请输入起点',
    id: 'bj-start',
    style: `
      width: 100%;
      height: 2rem;
      border: 1px solid #3698CD;
      border-radius: 0.3rem;
      font-size: 0.8rem;
      padding: 0 0.5rem;
    `,
  })
  setInputEl(formElement, {
    placeholder: '请输入终点',
    id: 'bj-end',
    style: `
      width: 100%;
      height: 2rem;
      border: 1px solid #3698CD;
      border-radius: 0.3rem;
      font-size: 0.8rem;
      padding: 0 0.5rem;
    `,
  })
}

function setInputEl(el: HTMLElement, opts: { placeholder: string; id: string; style: string }) {
  const inputElement = document.createElement('input')
  inputElement.setAttribute('id', opts.id)
  inputElement.setAttribute('type', 'text')
  inputElement.setAttribute('placeholder', opts.placeholder)
  inputElement.setAttribute(
    'style',
    opts.style,
  )
  inputElement.addEventListener('click', (e) => {
    e.stopPropagation()
  }, { capture: true })

  el.appendChild(inputElement)
  return inputElement
}

function setFormEl(el: HTMLElement, opts: { style: string }) {
  const formElement = document.createElement('form')
  formElement.setAttribute('id', 'form')
  formElement.setAttribute(
    'style',
    opts.style,
  )
  el.appendChild(formElement)
  return formElement
}

export function createBJSearchPanel() {
  const searchWidget = createFloatPanel()
  injectFormToEl(searchWidget)
}
