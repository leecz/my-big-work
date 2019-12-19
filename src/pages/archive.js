import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data, location }) => {

  const siteTitle = data.site.siteMetadata.title
  const groups = data.allMarkdownRemark.group

  return (
    <Layout location={location}>
      <SEO title={siteTitle} />

      {
        groups.map(group => {
          return (
            <div>
              <div className="text-2xl mt-3">{group.fieldValue}</div>
              <div>
                {group.edges.map(({ node }) => {
                  const title = node.frontmatter.title || node.fields.slug
                  return (
                    <article className="flex ml-3 mt-1" key={node.fields.slug}>
                      <div className="text-gray-700 text-sm font-light">{node.frontmatter.date}</div>
                      <Link className="ml-6 text-orange-700 hover:text-orange-600" to={node.fields.slug}>
                        {title}
                      </Link>
                    </article>
                  )
                })}

              </div>
            </div>
          )
        })
      }

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
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}) {
      group(field: fields___year) {
        edges {
          node {
            id
            frontmatter {
              date(formatString: "YYYY-MM-DD")
              title
            }
            fields {
              slug
            }
          }
        }
        fieldValue
      }
    }
  }
`
