## 项目计划

1. Markdown 的数据输入 ✓
2. 首页列表 ✓
3. 文章页面 ✓
4. 导航 ✓
5. 上下页连接 ✓
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

2. 首页加入文章列表
    安装处理文件资源和markdown处理的插件： `yarn add gatsby-source-filesystem gatsby-transformer-remark`
    编辑 `gatsby-config.js` :
    
    ```js
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/posts`,
      },
    },
    `gatsby-transformer-remark`,
    ```

    然后创建文件夹 `content/posts` 这里就是 markdown 文章存放的地方。可以弄几个markdown文件放这里测试。

    markdown 文件中可以添加如下的东西，称为 frontmatter ，表示文章的一些特定信息。在页面中可以从文章数据的 frontmatter 下获取这些信息。

    ```js
    ---
    path: "/blog/first-blog"
    date: "2019-12-16"
    title: "My first blog post"
    ---
    ```

    然后再 `gatsby-node.js` 中创建页面，和 slug 字段。
    
    ```js
    const path = require(`path`)
    const { createFilePath } = require('gatsby-source-filesystem')

    exports.createPages = async ({ graphql, actions }) => {
      const { createPage } = actions

      const blogPost = path.resolve(`./src/templates/blog-post.js`)
      const result = await graphql(
        `
          {
            allMarkdownRemark(
              sort: { fields: [frontmatter___date], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
        `
      )

      if (result.errors) {
        throw result.errors
      }

      // Create blog posts pages.
      const posts = result.data.allMarkdownRemark.edges

      posts.forEach((post, index) => {
        const previous = index === posts.length - 1 ? null : posts[index + 1].node
        const next = index === 0 ? null : posts[index - 1].node

        createPage({
          path: post.node.fields.slug,
          component: blogPost,
          context: {
            slug: post.node.fields.slug,
            previous,
            next,
          },
        })
      })
    }


    exports.onCreateNode = ({ node, actions, getNode }) => {
      const { createNodeField } = actions

      if (node.internal.type === `MarkdownRemark`) {
        const value = createFilePath({ node, getNode })
        createNodeField({
          name: `slug`,
          node,
          value,
        })
      }
    }

    ```

    然后创建文章的页面模板，`src/templates/blog-post.js`

    ```js
    import React from "react"
    import { Link, graphql } from "gatsby"

    import Layout from "../components/layout"
    import SEO from "../components/seo"

    const BlogPostTemplate = ({ data, location, pageContext }) => {
      const post = data.markdownRemark
      const siteTitle = data.site.siteMetadata.title
      const { previous, next } = pageContext

      return (
        <Layout location={location} title={siteTitle}>
          <SEO
            title={post.frontmatter.title}
            description={post.frontmatter.description || post.excerpt}
          />
          <article>
            <header>
              <h1>
                {post.frontmatter.title}
              </h1>
              <p>
                {post.frontmatter.date}
              </p>
            </header>
            <section dangerouslySetInnerHTML={{ __html: post.html }} />
          </article>

          <nav>
            <ul>
              <li>
                {previous && (
                  <Link to={previous.fields.slug} rel="prev">
                    ← {previous.frontmatter.title}
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link to={next.fields.slug} rel="next">
                    {next.frontmatter.title} →
                    </Link>
                )}
              </li>
            </ul>
          </nav>
        </Layout>
      )
    }

    export default BlogPostTemplate

    export const query = graphql`
      query BlogPostBySlug($slug: String!) {
        site {
          siteMetadata {
            title
          }
        }
        markdownRemark(fields: { slug: { eq: $slug } }) {
          id
          excerpt(pruneLength: 160)
          html
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            description
          }
        }
      }
    `

    ```

    首页加入文章列表，

    ```js
    import React from "react"
    import { graphql, Link } from "gatsby"

    import Layout from "../components/layout"
    import SEO from "../components/seo"

    const IndexPage = ({ data, location }) => {

      const siteTitle = data.site.siteMetadata.title
      const posts = data.allMarkdownRemark.edges

      return (
        <Layout location={location}>
          <SEO title={siteTitle} />


          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <article key={node.fields.slug}>
                <header>
                  <h3 >
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </h3>
                  <small>{node.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </article>
            )
          })}
        </Layout>
      )
    }

    export default IndexPage
    export const pageQuery = graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          edges {
            node {
              excerpt
              fields {
                slug
              }
              frontmatter {
                date(formatString: "YYYY-MM-DD")
                title
                description
              }
            }
          }
        }
      }
    `

    ```
     
    基本的文章列表和文章详情页就做好了

