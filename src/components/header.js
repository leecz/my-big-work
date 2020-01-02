import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <header className="flex h-20 items-center">
    <div className="flex items-center justify-center w-full">
      <Link to="/" className="mr-8">
        {siteTitle}
      </Link>
      <Link to="/archive" className="mr-8">
        归档
      </Link>
      <Link to="/lab" className="mr-8">
        实验
      </Link>
      <Link to="/about">关于</Link>
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
