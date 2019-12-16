import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <div className="max-w-sm mx-auto flex p-6 bg-white rounded-lg shadow-xl">
      <div className="ml-6 pt-1">
        <h4 className="text-xl text-gray-900 leading-tight">ChitChat</h4>
        <p className="text-base text-gray-600 leading-normal">
          You have a new message!
        </p>
      </div>
    </div>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage
