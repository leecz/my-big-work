import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const TagsPage = ({ pageContext, data, location }) => {

  const { tag } = pageContext
  const siteTitle = data.site.siteMetadata.title
  const { edges, totalCount } = data.allMarkdownRemark

  return (
    <Layout location={location}>
      <SEO title={siteTitle} />
      <div className="bg-white p-10">
        <div className="flex items-center justify-between text-gray-600 text-sm mb-3">
          <div className="">{tag}</div>
          <div className="ml-4">共 {totalCount} 篇</div>
        </div>
        {
          edges.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <article className="flex ml-3 mt-1" key={node.fields.slug}>
                <div className="text-gray-700 text-sm font-light">{node.frontmatter.date}</div>
                <Link className="ml-6 text-orange-700 hover:text-orange-600" to={node.fields.slug}>
                  {title}
                </Link>
              </article>
            )
          })
        }
      </div>

    </Layout>
  )
}

export default TagsPage
export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: {fields: frontmatter___date, order: DESC}
      filter: { frontmatter: { tags: { in : [$tag] } } }
    ) {
        totalCount
        edges {
          node {
            frontmatter {
              date(formatString: "YYYY-MM-DD")
              title
            }
            fields {
              slug
            }
          }
        }
    }
  }
`
