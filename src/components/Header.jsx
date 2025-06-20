import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header_container">
        <div className="header_content">
          {/* Timeline redir */}
          <Link to="/" className="header_logo-icon">
            <div className="header_logo-icon">
              <img
                className="header_logo-icon_item"
                src="/logo_icon_static.png"
                alt="лого"
              />
              <img
                className="header_logo-icon_item"
                src="/logo_icon_rotate.png"
                alt="лого анимация"
              />
            </div>
          </Link>

          {/* Logo String */}
          <div className="header_logo-str">
            <img
              src="/logo_str.png"
              alt="лого"
              className="header_logo-str_img"
            />
            <div className="header_logo-str_underline">
              <div className="header_logo-str_underline_container" />
              <div className="header_logo-str_underline_circle">
                <div className="header_logo-str_underline_circle_rectangle" />
              </div>
              <div className="header_logo-str_underline_circle">
                <div className="header_logo-str_underline_circle_rectangle" />
              </div>
            </div>
          </div>

          {/* Charts redir */}
          <div className="header_charts-icon">
            <a href="/charts">
              <img
                className="header_charts-icon_item"
                src="/charts_icon.png"
                alt="диаграммы"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;