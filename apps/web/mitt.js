import mitt from 'mitt'
const mitt = mitt()
export default mitt


// // 组件 A
// <script setup>
// import mitt from './mitt'
// const handleClick = () => {
//     mitt.emit('handleChange')
// }
// </script>

// // 组件 B 
// <script setup>
// import mitt from './mitt'
// import { onUnmounted } from 'vue'
// const someMethed = () => { ... }
// mitt.on('handleChange',someMethed)
// onUnmounted(()=>{
//     mitt.off('handleChange',someMethed)
// })
// </script>