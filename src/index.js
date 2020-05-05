//import './index.css';
import './styles/index.scss';
import $ from "jquery";

console.log($("body")[0]);
const p = document.createElement('p')
p.textContent = "Hello from dev server!.!.!.!"
document.body.appendChild(p);


const p2 = document.createElement('p')
const numbers1 = [1, 2, 3, 4, 5, 6]
const numbers2 = [7, 8, 9, 10]
const numbers3 = [...numbers1, ...numbers2]
p2.textContent = numbers3.join(' ')
document.body.appendChild(p2)

