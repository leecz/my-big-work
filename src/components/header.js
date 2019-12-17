import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <header
    className=""
  >
    <div>
      <Link
        to="/"
      >
        {siteTitle}
      </Link>
      <Link to="archive">归档</Link>
      <Link to="/lab">实验</Link>
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
