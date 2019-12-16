## 项目计划

1. Markdown 的数据输入
2. 首页列表
3. 文章页面
4. 导航
5. 上下页连接
6. 文章目录页面
7. 样式调整。
8. 图片处理


## 步骤

1.  加入全局样式
   `yarn add tailwindcss`

   新建全局样式文件 `src/styles/global.css` 

   在 `gatsby-browser.js`中引用, `import "./src/styles/global.css"`
   
   使用postcss 的方式引入 tailwind, `yarn add gatsby-plugin-postcss`

   编辑 gatsby-config.js ，`plugins: [`gatsby-plugin-postcss`],

   创建 postcss.config.js, 编辑：
   
   ```js
   module.exports = () => ({
      plugins: [require("tailwindcss")],
   })
   ```

   在 `global.css` 引用 tailwindcss

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
