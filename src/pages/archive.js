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
              <div>{group.fieldValue}</div>
              <div>
                {group.edges.map(({ node }) => {
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
              description
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
