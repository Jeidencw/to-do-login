import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js"
import { getFirestore, collection, addDoc, doc, onSnapshot,deleteDoc, updateDoc, orderBy, query, where, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { activeDarkMode, activeLightMode, activeSetActiveStyle } from "./switch-color.js"


const formAddTask = document.querySelector('[data-js="add__task"]')
const pageLogin = document.querySelector('[data-js="login__page"]')
const pageCadastro = document.querySelector('[data-js="cadastro__page"]')
const formMenuButtons = [...document.querySelector('.login__menu').children]
const todoList = document.querySelector('.todo__list')
const ul = document.querySelector('.todo__list')
const inputSearch = document.querySelector('.input__search')
const orderAscDesc = document.querySelectorAll('input[name="order__asc-desc"]')
const orderChecked = document.querySelectorAll('input[name="order__checked"]')
const orderAlphaDate = document.querySelectorAll('input[name="order__alpha-date"]')
const darkModeIcon = document.querySelector('.dark__mode-icon')
const loginContainer = document.querySelector('[data-js="container__login"]')
const todoContainer = document.querySelector('[data-js="container__todo"]')
const buttonLoginGoogle = document.querySelector('[data-js="button__login-google"]')


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

export const userIDModule = (() => {
    let userID = null

    const setUserID = (newUserID) => {
        userID = newUserID
    }

    const getUserID = () => {
        return userID
    }

    return {
        setUserID,
        getUserID
    }
})()

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)
const collectionTask = collection(db, 'tasks')
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


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

const clearLis = () => document.querySelectorAll('li').forEach(li => li.remove())

const renderTasks = snapshot => {
    const documentFragment = document.createDocumentFragment()

    snapshot.docChanges().forEach(docChange => {
        const { taskValue, date, checked } = docChange.doc.data()
        const id = docChange.doc.id

        const dateFirestore = date?.toDate()
        const day = String(dateFirestore?.getDate()).padStart(2, '0')
        const month = String(dateFirestore?.getMonth() + 1).padStart(2, '0')
        const year = dateFirestore?.getFullYear()
        
        const formatedDate = `${day}/${month}/${year}`

        if(docChange.type === 'added'){
            const li = document.createElement('li')
            li.classList.add('todo__item')
            li.setAttribute('data-item', id)
            li.setAttribute('data-id', id)

            const divTasks = document.createElement('div')
            divTasks.classList.add('todo__tasks')

            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.setAttribute('data-check', id)
            checked ? checkbox.setAttribute('checked', checked) : ''

            const divText = document.createElement('div')
            divText.classList.add('todo__text')

            const pTask = document.createElement('p')
            pTask.classList.add('task')
            pTask.setAttribute('class', checked ? 'checked' : '')
            pTask.setAttribute('data-task', id)
            pTask.textContent = taskValue

            const pDate = document.createElement('p')
            pDate.classList.add('date')
            pDate.setAttribute('data-date', id)
            pDate.textContent = formatedDate === 'undefined/NaN/undefined' ? '' : formatedDate
            
            const divIcons = document.createElement('div')
            divIcons.classList.add('todo__item-icons')

            const spanTrash = document.createElement('span')
            spanTrash.classList.add('material-symbols-outlined')
            spanTrash.setAttribute('data-trash', id)
            spanTrash.textContent = 'delete'

            const spanEdit = document.createElement('span')
            spanEdit.classList.add('material-symbols-outlined')
            spanEdit.setAttribute('data-edit', id)
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

const handleInputSearch = e => {
    const inputValue = e.target.value.trim().toLowerCase()
    const tasks = [...document.querySelectorAll('.todo__text')]

    const filteredTask = tasks.filter(task => task.textContent.toLocaleLowerCase().includes(inputValue))
    const notFilteredTask = tasks.filter(task => !task.textContent.toLocaleLowerCase().includes(inputValue))

    filteredTask.forEach(task => task.parentNode.parentNode.classList.remove('hidden'))
    notFilteredTask.forEach(task => task.parentNode.parentNode.classList.add('hidden'))
}

const handleRegisterForm = async e => {
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
}

const handleAddForm = async (e, user) => {
    e.preventDefault()  

    const taskValue = DOMPurify.sanitize(e.target.add__input.value).trim()
    const dateInput = DOMPurify.sanitize(e.target.date.value)
    
    let date = dateInput ? new Date(dateInput) : null
    date?.setMinutes(date.getMinutes() + date?.getTimezoneOffset())

    await addDoc(collectionTask, {
        taskValue,
        date,
        checked: false,
        userID: user.uid
    })
    
    e.target.reset()
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

const editState = (() => {
    let isEditing = false

    return{
        getIsEditing: () => isEditing,
        setIsEditing: () => isEditing = !isEditing
    }
})()

const editTask = async id => {
    const inputTextToEdit = document.querySelector(`[data-task="${id}"]`)
    const inputDateToEdit = document.querySelector(`[data-date="${id}"]`)
    const inputCheck = document.querySelector(`[data-check="${id}"]`)
    const dateFormatInput = inputDateToEdit.textContent.split('/').reverse().join('-')

    ul.removeEventListener('click', ulController)

    inputTextToEdit.classList.remove('checked')
    inputCheck.checked = false

    const inputEditText = document.createElement('input')
    const inputEditDate = document.createElement('input')
    inputEditDate.type = 'date'
    inputEditDate.value = dateFormatInput
    inputEditText.classList.add('input__edit-text')
    inputEditDate.style.padding = '5px'
    inputEditDate.style.fontWeight = '500'
    inputEditText.value = DOMPurify.sanitize(inputTextToEdit.textContent)
    
    inputDateToEdit.replaceWith(inputEditDate)
    inputTextToEdit.replaceWith(inputEditText)

    inputEditText.focus()

    const switchToParagraph = async () => {
        inputTextToEdit.textContent = inputEditText.value
        inputDateToEdit.textContent = inputEditDate.value.split('-').reverse().join('/')
        inputEditDate.replaceWith(inputDateToEdit)
        inputEditText.replaceWith(inputTextToEdit)

        let date = inputEditDate.value ? new Date(inputEditDate.value) : null
        date?.setMinutes(date.getMinutes() + date?.getTimezoneOffset())
        ul.addEventListener('click', ulController)

        try {
            await updateDoc(doc(db, 'tasks', id), {
                taskValue: inputEditText.value,
                date,
                checked: false
            })
        } catch (error) {
            console.log('erro ao salvar edição')
        }
    }

    inputEditText.parentNode.addEventListener('keypress', e => {
        if(e.key === 'Enter'){
            switchToParagraph()
        }
    })

    const handleClickEdit = e => {
        if(e.target !== inputEditText && e.target !== inputEditDate){
            if(editState.getIsEditing()){
                switchToParagraph()  
                editState.setIsEditing()
                document.removeEventListener('click', handleClickEdit)
                return
            }
            editState.setIsEditing()
        }
    }

    document.addEventListener('click', handleClickEdit)
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

export const updateUserColor = async (userID, color) => {   
    try {
        await updateDoc(doc(db, "users", userID), {
            colorUser: color
        })
    } catch (error) {
        console.log('Erro user color', error)
    }
}

export const updateDarkMode = async userID => {
    try {
        await updateDoc(doc(db, 'users', userID), {
            darkMode: darkModeIcon.textContent.trim()
        })
    } catch (error) {
        console.log('Erro user dark mode', error)
    }
}

const updateOrderList = user => {
    let inputName = 'taskValue'
    let orderValue = orderBy(inputName)
    let whereValue = ''
    
    orderAscDesc.forEach(radio => {
        if(!radio.checked)return 

        if(radio.value === 'order__asc' ){
            orderValue = orderBy(inputName)
            clearLis()
        }else if(radio.value === 'order__desc'){
            orderValue = orderBy(inputName, 'desc')
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
    orderAlphaDate.forEach(radio => {
        if(!radio.checked)return
        
        if(radio.value === 'data' ){
            inputName = 'date'
            clearLis()
        }else if(radio.value === 'alpha'){
            inputName = 'taskValue'
            clearLis()
        }
    })
    const onlyUser = where('userID', '==', user.uid)
    const queryPhrases = query(
        collectionTask, 
        whereValue, 
        onlyUser,
        orderValue
    )

    clearLis()
    onSnapshot(queryPhrases, renderTasks)
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

const login = e => {
    e.preventDefault()

    const loginUser = e.target.login__user.value
    const loginPassword = e.target.login__password.value

    try {
        signInWithEmailAndPassword(auth, loginUser, loginPassword)

    } catch (error) {
        console.log(error)
    }
    e.target.reset()
}

const loginWithGoogle = async () => {
    try {
        await signInWithRedirect(auth, provider)
    } catch (error) {
        console.log('error google', error);
    }
}

const logOut = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        alert('erro ao sair')
    }
}

const createUserDoc = async user => {
    try {
        const userDocRef = doc(db, 'users', user.uid)
        const docSnapshot = await getDoc(userDocRef)

        if(!docSnapshot.exists()){
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

const getUserColor = async user => {
    const docUser = await getDoc(doc(db, "users", user.uid))

    const colorUserData = docUser.exists() ? docUser.data().colorUser : 'color-4';
    const darkModeUser = docUser.exists() ? docUser.data().darkMode : 'dark_mode'

    if (darkModeUser === 'dark_mode') {
        activeLightMode()
    } else if (darkModeUser === 'light_mode') {
        activeDarkMode()
    }

    activeSetActiveStyle(colorUserData)
}

const handleLoggedUser = async user =>{
    createUserDoc(user)

    userIDModule.setUserID(user.uid)

    loginContainer.style.display = 'none'
    todoContainer.style.display = 'block'

    orderAscDesc.forEach(radio => radio.onchange = () => updateOrderList(user))
    orderChecked.forEach(radio => radio.onchange = () => updateOrderList(user))
    orderAlphaDate.forEach(radio => radio.onchange = () => updateOrderList(user))

    updateOrderList(user)
    getUserColor(user)

    formLogin.removeEventListener('submit', login)
    formAddTask.onsubmit = e => handleAddForm(e, user)
    logOutBtn.addEventListener('click', logOut)
    logOutBtn.style.display = 'block'

}

const handleNotLoggedUser = () => {
    todoContainer.style.display = 'none'
    loginContainer.style.display = 'flex'

    formLogin.addEventListener('submit', login)
    logOutBtn.removeEventListener('click', logOut)
    formAddTask.onsubmit = ''
    logOutBtn.style.display = 'none'
}

const handleAuthStateChanged = user => {
    if (user) {
        handleLoggedUser(user)
    } else {
        handleNotLoggedUser()
    }
}

onAuthStateChanged(auth, handleAuthStateChanged)

ul.addEventListener('click', ulController)
formRegister.addEventListener('submit', handleRegisterForm)
inputSearch.addEventListener('input', handleInputSearch)
buttonLoginGoogle.addEventListener('click', loginWithGoogle)