import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js"
import { getFirestore, collection, addDoc, doc, onSnapshot,deleteDoc, updateDoc, orderBy, query, where, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"


const formAddTask = document.querySelector('[data-js="add__task"]')
const pageLogin = document.querySelector('[data-js="login__page"]')
const pageCadastro = document.querySelector('[data-js="cadastro__page"]')
const formMenuButtons = [...document.querySelector('.login__menu').children]
const todoList = document.querySelector('.todo__list')
const ul = document.querySelector('.todo__list')
const orderAscDesc = document.querySelectorAll('input[name="order__asc-desc"]')
const orderChecked = document.querySelectorAll('input[name="order__checked"]')

const formLogin = document.querySelector('[data-js="login"]')
const formRegister = document.querySelector('[data-js="register"]')
const logOutBtn = document.querySelector('[data-js="log-out"]')

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
const auth = getAuth(app)


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

const clearLis = () => document.querySelectorAll('li').forEach(li => li.remove())

const addTask = async ({ taskValue, date }) => {
    await addDoc(collectionTask, {
        taskValue,
        date,
        checked: false
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

const updateOrderList = () => {
    let orderValue = orderBy('taskValue')
    let whereValue = ''
    
    
    orderAscDesc.forEach(radio => {
        if(!radio.checked)return 

        if(radio.value === 'order__asc' ){
            orderValue = orderBy('taskValue')
            clearLis()
        }else{
            orderValue = orderBy('taskValue', 'desc')
            clearLis()
        }
    })
    
    orderChecked.forEach(radio => {
        if(!radio.checked)return
        
        if(radio.value === 'Completas'){
            whereValue = where("checked", "==", true)
            clearLis()
        }else if(radio.value === 'Incompletas'){
            whereValue = where("checked", "==", false)
            clearLis()
        }
    })

    const queryOrder = query(collectionTask, whereValue, orderValue)
    onSnapshot(queryOrder, renderTasks)
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

formLogin.addEventListener('submit', e => {
    e.preventDefault()

    const loginUser = e.target.login__user.value
    const loginPassword = e.target.login__password.value

    try {
        signInWithEmailAndPassword(auth, loginUser, loginPassword)

    } catch (error) {
        console.log(error)
    }

    e.target.reset()
})

formRegister.addEventListener('submit', async e => {
    e.preventDefault()

    const registerUser = e.target.register__user.value
    const registerPassword = e.target.register__password.value
    const registerPasswordConfirmed = e.target.register__confirmed.value

    if(registerPassword === registerPasswordConfirmed){
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, registerUser, registerPassword)
            const user = userCredential.user


        }catch(err){
            console.log(err)
        }
    }


    e.target.reset()
})

logOutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth)
        console.log('saiu')
    } catch (error) {
        console.log('erro ao sair')
    }
})

const createUserDoc = async user => {
    try {
        const userDocRef = doc(db, 'users', user.uid)
        const docSnapshot = await getDoc(userDocRef)

        if(!docSnapshot.exist){
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                userID: user.uid
            })
        }

    } catch (error) {
        console.log('Erro ao registrar usuario')
    }
}

onAuthStateChanged(auth, (user) => {
    const loginContainer = document.querySelector('[data-js="container__login"]')
    const todoContainer = document.querySelector('[data-js="container__todo"]')

    if (user) {
        createUserDoc(user)


        loginContainer.style.display = 'none'
        todoContainer.style.display = 'block'

        const uid = user.uid
    
    } else {
        todoContainer.style.display = 'none'
        loginContainer.style.display = 'flex'
    }
})


orderAscDesc.forEach(radio => radio.addEventListener('change', updateOrderList))
orderChecked.forEach(radio => radio.addEventListener('change', updateOrderList))

updateOrderList()

ul.addEventListener('click', ulController)
formAddTask.addEventListener('submit', handleAddForm)