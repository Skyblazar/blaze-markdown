import React, { Component } from 'react';
import { Remarkable } from 'remarkable';
import './App.scss';

class App extends Component {
  state = {
    markdownHTML: "",
    pdfLoading: false,
    imgLoading: false
  }

  markdownText = "";

  /**
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e
   */
  onChange = (e) => {
    this.markdownText = e.target.value;

    const md = new Remarkable({
      linkify: true,
      breaks: true,
      html: true
    });
    this.setState({
      markdownHTML: md.render(this.markdownText)
    });
  };

  downloadPDF = (type = "pdf") => {
    const loadingKey = `${type}Loading`;
    this.setState({ [loadingKey]: true });

    const uniqueLink = Date.now().toString();
    fetch(`http://192.168.43.45:8000/pdf/${uniqueLink}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        md: this.markdownText
      })
    }).then((res) => res.blob().then((blob) => {
      this.setState({ [loadingKey]: false });
      if (blob.size === 0 || blob.type === "") return;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `md_to_${type}_${uniqueLink.substring(7, 13)}.${type === "pdf" ? "pdf" : "png"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }));
  };

  render() {
    const { markdownHTML } = this.state;
    return (
      <div className="app container">
        <div className="content">
          <div className="left">
            <textarea
              name="markdownText"
              id=""
              placeholder="Type some markdown"
              onChange={this.onChange}>

            </textarea>
          </div>

          <div className="right">
            <div className="preview-container">
              <div
                className="preview"
                dangerouslySetInnerHTML={{ __html: markdownHTML }}></div>

              <div className="download">
                <button className="pdf" onClick={this.downloadPDF}>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
