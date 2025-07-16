import React from 'react';
import data from '@/lib/pdf-libs/costs.json'; // assume this json above is saved here
import '../../public/pdf.css'

export default function PdfPreview() {
  return (
    <div className="document">
      <div className="page">
        <header className="indexmaker-header">
          <div className="indexmaker-logo">IndexMaker</div>
          <div className="main-title">{data.title}</div>
        </header>

        <div className="date-info">The report is dated {data.reportDate}.</div>
        <div className="disclaimer">{data.disclaimer}</div>

        <div className="content-section">
          {data.introParagraphs.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </div>

        <div className="numbered-list">
          {data.costsBreakdown.map((item, idx) => (
            <div key={idx} className="numbered-item">
              <div className="number-circle">{idx + 1}</div>
              <div className="item-content">
                <div className="item-title">{item.title}:</div>
                {item.description}
              </div>
            </div>
          ))}
        </div>

        <div className="page-number">1</div>
      </div>

      <div className="page">
        <h2>IndexMaker Indexes List</h2>
        <table className="funds-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Fund and share class name</th>
              <th>Asset allocation</th>
              <th>Ongoing charges</th>
              <th>Ongoing costs</th>
              <th>One-off costs</th>
              <th>Transaction costs</th>
              <th>Incidental costs</th>
              <th>Total fund costs</th>
            </tr>
          </thead>
          <tbody>
            {data.funds.map((fund, idx) => (
              <tr key={idx}>
                <td>{fund.ticker}</td>
                <td>{fund.name}</td>
                <td>{fund.allocation}</td>
                <td>{fund.ongoingCharges}</td>
                <td>{fund.ongoingCosts}</td>
                <td>{fund.oneOffCosts}</td>
                <td>{fund.transactionCosts}</td>
                <td>{fund.incidentalCosts}</td>
                <td>{fund.totalCosts}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.footnotes.map((note, idx) => (
          <div key={idx} className="table-note">{note}</div>
        ))}

        <div className="page-number">2</div>
      </div>

      <div className="page">
        <div className="important-header">Investment risk information</div>

        {data.risks.map((risk, idx) => (
          <div key={idx} className="legal-text">
            <strong>{risk.title}:</strong> {risk.description}
          </div>
        ))}

        <div className="footer-section">
          <div className="footer-logo">
            <div className="connect-info">
              Connect with IndexMaker®<br />
              {data.footer.website}
            </div>
            <div className="indexmaker-brand">IndexMaker</div>
          </div>
          <div className="legal-text">{data.footer.issuer}</div>
          <div className="copyright">{data.footer.copyright}</div>
        </div>

        <div className="page-number">3</div>
      </div>
    </div>
  );
}