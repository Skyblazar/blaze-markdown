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

  /** @param {String} fileType */
  download = (fileType = "pdf") => {
    const loadingKey = `${fileType}Loading`;
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
      link.setAttribute('download', `md_to_${fileType}_${uniqueLink.substring(7, 13)}.${fileType === "pdf" ? "pdf" : "png"}`);
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
            <header>
              <span>Text Input</span>

              <div className="download" style={{ opacity: 0 }}>
                <button className="image">
                  Image
                </button>
              </div>
            </header>
            <textarea
              name="markdownText"
              id=""
              placeholder="Type some markdown"
              onChange={this.onChange}>

            </textarea>
          </div>

          <div className="right">
            <header>
              <span>Markdown</span>
              <div className="download">
                <button className="image" onClick={() => this.download("image")}>
                  Image
                </button>
                <button className="pdf" onClick={() => this.download("pdf")}>
                  PDF
                </button>
              </div>
            </header>
            <div className="preview-container">
              <div
                className="preview"
                dangerouslySetInnerHTML={{ __html: markdownHTML }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
