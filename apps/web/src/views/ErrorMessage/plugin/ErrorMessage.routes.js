const route = [
    {
        path: "/404",
        name: "404",
        component: () => import("../../ErrorMessage/404.vue"),
        meta: {
            type: 'frameOut',
            requiresAuth: true, //有一些页面是否登录才能进去
            name: "404",
        },
    },
    {
        path: "/500",
        name: "500",
        component: () => import("../../ErrorMessage/500.vue"),
        meta: {
            type: 'frameOut',
            requiresAuth: true, //有一些页面是否登录才能进去
            name: "500",
        },
    }
]
export default route
