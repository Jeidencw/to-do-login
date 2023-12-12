import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js"
import { getFirestore, collection, addDoc, doc, onSnapshot,deleteDoc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const formAddTask = document.querySelector('[data-js="add__task"]')
const pageLogin = document.querySelector('[data-js="login__page"]')
const pageCadastro = document.querySelector('[data-js="cadastro__page"]')
const formMenuButtons = [...document.querySelector('.login__menu').children]
const todoList = document.querySelector('.todo__list')
const ul = document.querySelector('.todo__list')

const firebaseConfig = {
  apiKey: "AIzaSyA6GqGDGzYKZKSvTXtiiM8bsbv-cAI5jiQ",
  authDomain: "to-do-1d103.firebaseapp.com",
  projectId: "to-do-1d103",
  storageBucket: "to-do-1d103.appspot.com",
  messagingSenderId: "336717370902",
  appId: "1:336717370902:web:2cdba5244908593505c737",
  measurementId: "G-H5VQCYKDN0"
}


const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)
const collectionTask = collection(db, 'tasks')


formMenuButtons.forEach(button => {
    button.addEventListener('click', e => {
        formMenuButtons.forEach(btn => {
            btn.classList.remove('active')
        })

        if(button.textContent === 'Login'){
            pageLogin.style.display = 'flex'
            pageCadastro.style.display = 'none'
            e.target.classList.add('active')
            return
        }
        pageLogin.style.display = 'none'
        pageCadastro.style.display = 'flex'
        e.target.classList.add('active')
    })
})
//const isChecked = document.querySelector(`[data-check="${taskValue}"]`)

/*
    <li class="todo__item" data-id="id">
        <div class="todo__tasks">
            <input data-check="Tarefa 1" type="checkbox">
            <div class="todo__text">
                <p data-task="Tarefa 1" class="task">Tarefa 1</p>
                <p data-date="Tarefa 1" class="date">12/12/2023</p>
            </div>
        </div>
        <div class="todo__item-icons">
            <span data-trash="Tarefa 1"  class="material-symbols-outlined">
                delete
            </span>
            <span  data-edit="Tarefa 1" class="material-symbols-outlined">
                edit
            </span>
        </div>
    </li>
*/

const renderTasks = snapshot => {
        const documentFragment = document.createDocumentFragment()

        snapshot.docChanges().forEach(docChange => {
            const { taskValue, date, checked } = docChange.doc.data()
            const id = docChange.doc.id

            if(docChange.type === 'added'){
                const li = document.createElement('li')
                const divTasks = document.createElement('div')
                const checkbox = document.createElement('input')
                const divText = document.createElement('div')
                const pTask = document.createElement('p')
                const pDate = document.createElement('p')
                const divIcons = document.createElement('div')
                const spanTrash = document.createElement('span')
                const spanEdit = document.createElement('span')
                
                li.classList.add('todo__item')
                li.setAttribute('data-item', id)
                li.setAttribute('data-id', id)
                divTasks.classList.add('todo__tasks')
                checkbox.type = 'checkbox'
                checkbox.setAttribute('data-check', id)
                checked ? checkbox.setAttribute('checked', checked) : ''
                divText.classList.add('todo__text')
                pTask.classList.add('task')
                pTask.setAttribute('class', checked ? 'checked' : '')
                pDate.classList.add('date')
                pTask.setAttribute('data-task', id)
                pTask.textContent = taskValue
                pDate.setAttribute('data-date', id)
                pDate.textContent = date
                divIcons.classList.add('todo__item-icons')
                spanTrash.classList.add('material-symbols-outlined')
                spanEdit.classList.add('material-symbols-outlined')
                spanTrash.setAttribute('data-trash', id)
                spanEdit.setAttribute('data-edit', id)
                spanTrash.textContent = 'delete'
                spanEdit.textContent = 'edit'
            
                divTasks.append(checkbox, divText)
                divText.append(pTask, pDate)
                divIcons.append(spanEdit, spanTrash)
                li.append(divTasks, divIcons)

                documentFragment.append(li)
            }
        })
        todoList.append(documentFragment)
}

const addTask = async ({ taskValue, date }) => {
    await addDoc(collectionTask, {
        taskValue,
        date
    })
}

const delTask = async id => {
    const taskToDelete = document.querySelector(`[data-item="${id}"]`)
    const idToDelete = taskToDelete.dataset.id

    try {
        await deleteDoc(doc(db, "tasks", idToDelete))

        taskToDelete.remove()
    } catch (error) {
        console.log('Erro ao deletar tarefa')
    }
}

const editTask = async id => {
    const mainDate = document.querySelector('#date')
    const mainInputText = document.querySelector('.add__input')
    const textToEdit = document.querySelector(`[data-task="${id}"]`).textContent
    const dateToEdit = document.querySelector(`[data-date="${id}"]`)
        .textContent
        .split('/')
        .reverse()
        .join('-')


    mainDate.value = dateToEdit
    mainInputText.value = textToEdit
    mainInputText.focus()
}

const checkTask = async ({ checkBtn, isChecked }) => {
    try {
        const changeText = document.querySelector(`[data-task="${checkBtn}"]`)

        await updateDoc(doc(db, "tasks", checkBtn), {
            checked: isChecked
        })

        isChecked ? changeText.classList.add('checked') : changeText.classList.remove('checked')
    } catch (error) {
        console.log('Erro ao confirmar')
    }
}

const handleAddForm =  e => {
    e.preventDefault()

    const taskValue = DOMPurify.sanitize(e.target.add__input.value).trim()
    const date = DOMPurify.sanitize(e.target.date.value)
        .split('-')
        .reverse()
        .join('/')

    addTask({ taskValue, date  })

    e.target.reset()
}

const ulController = e => {
    const deteleBtn = e.target.dataset.trash
    const editBtn = e.target.dataset.edit
    const checkBtn = e.target.dataset.check
    const isChecked = e.target.checked

    if(deteleBtn)delTask(deteleBtn)
    if(checkBtn)checkTask({ checkBtn, isChecked })
    if(editBtn)editTask(editBtn)
}

const queryTest = query(collectionTask, orderBy('taskValue', 'desc'))

onSnapshot(queryTest, renderTasks)
ul.addEventListener('click', ulController)
formAddTask.addEventListener('submit', handleAddForm)