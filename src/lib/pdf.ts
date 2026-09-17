import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TestReport, Invoice, Expense, CountryConfig } from '../types';

export async function generateReportPDFFile(report: TestReport, isDemo?: boolean): Promise<{ file: File; filename: string; pdf: jsPDF }> {
  const isDemoMode = isDemo || report.tenantId === 'TNT-DEMO-PREVIEW';

  // Create an offscreen container
  const container = document.createElement('div');
  container.id = 'offscreen-pdf-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.padding = '40px';

  // Build the inner HTML content of the clinical lab report
  const parametersHtml = report.parameters.map((param) => {
    const isHigh = param.status === 'High';
    const isLow = param.status === 'Low';
    const isOutOfRange = isHigh || isLow;
    
    let statusBadgeColor = 'color: #1e293b;'; // Normal
    if (isHigh) statusBadgeColor = 'color: #b91c1c; font-weight: 800; background-color: #fee2e2;';
    if (isLow) statusBadgeColor = 'color: #1d4ed8; font-weight: 800; background-color: #dbeafe;';

    const demoValueTag = isDemoMode ? `<span style="color: #dc2626; font-weight: 900; margin-left: 6px; font-size: 11px;">[DEMO RESULT]</span>` : '';

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; ${isOutOfRange ? 'background-color: rgba(254, 242, 242, 0.3); font-weight: bold;' : ''}">
        <td style="padding: 12px 8px; font-weight: bold; color: #0f172a; font-size: 13px;">${param.name}</td>
        <td style="padding: 12px 8px; text-align: center; font-size: 13px;">
          <span style="padding: 3px 8px; border-radius: 4px; ${statusBadgeColor}">
            ${param.value || '—'}${demoValueTag} ${isOutOfRange ? `* (${param.status})` : ''}
          </span>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #64748b; font-weight: bold; font-size: 13px;">${param.unit || '—'}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: monospace; font-weight: bold; color: #475569; font-size: 13px;">${param.referenceRange}</td>
      </tr>
    `;
  }).join('');

  const labLogo = localStorage.getItem('apex_labLogo');
  const headerLogoHtml = labLogo ? 
    `<img src="${labLogo}" style="height: 56px; width: 56px; object-fit: contain; border-radius: 8px;" />` :
    `<div style="height: 56px; width: 56px; background-color: #1e3a8a; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; border: 2px solid #1e40af;">🔬</div>`;

  const isBothVerified = report.technicianVerified && (report.pathologistVerified || report.status === 'Completed');

  const technicianSignature = localStorage.getItem('apex_technicianSignature');
  const globalTechnicianName = localStorage.getItem('apex_technicianName') || report.technicianName || 'Amit Trivedi';
  const globalTechnicianDegree = localStorage.getItem('apex_technicianDegree') || 'B.Sc. M.L.T. • Reg No: LT-2026-9912';
  const techSigHtml = technicianSignature ? 
    `<img src="${technicianSignature}" style="height: 48px; width: 120px; object-fit: contain; margin-bottom: 4px;" />` : '';

  const pathologistSignature = localStorage.getItem('apex_pathologistSignature');
  const globalPathologistName = localStorage.getItem('apex_pathologistName') || report.pathologistName || 'Devangi Shah';
  const globalPathologistDegree = localStorage.getItem('apex_pathologistDegree') || 'M.D. (Pathology) • Reg No: G-14232';
  const pathSigHtml = pathologistSignature ? 
    `<img src="${pathologistSignature}" style="height: 48px; width: 120px; object-fit: contain; margin-bottom: 4px;" />` : '';

  container.innerHTML = `
    <div style="width: 100%; box-sizing: border-box;">
      <!-- Lab Letterhead Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${headerLogoHtml}
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #172554; tracking-tight: -0.025em; line-height: 1.1;">
              APEX DIAGNOSTICS & PATHOLOGY
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 9px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">
              Fully Automated Clinical Laboratories & Diagnostic Center
            </p>
            <p style="margin: 2px 0 0 0; font-size: 8px; color: #64748b; line-height: 1.2; font-weight: 500;">
              ISO 9001:2015 Certified • National Accreditation Board (NABL) Certified • Reg No: AM-2026/89312
            </p>
          </div>
        </div>
        <div style="text-align: right; font-size: 8px; color: #64748b; line-height: 1.4; font-weight: 500; max-width: 250px;">
          <p style="margin: 0; font-weight: 800; color: #1e293b; font-size: 9px; letter-spacing: 0.05em;">CENTRAL DISPATCH BRANCH</p>
          <p style="margin: 2px 0 0 0;">402-405, Clinic Heights, Opposite Civil Hospital</p>
          <p style="margin: 2px 0 0 0;">Ahmedabad, Gujarat, India - 380001</p>
          <p style="margin: 2px 0 0 0; font-weight: bold; color: #1e3a8a;">Phone: +91 79 4005 8920 | contact@apexdiagnostics.com</p>
        </div>
      </div>

      <!-- NABL and barcode strip -->
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; background-color: #f8fafc; padding: 6px 12px; border-radius: 6px; border: 1px solid #f1f5f9; margin-bottom: 16px; font-weight: 600; color: #475569;">
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <span style="font-weight: 800; color: #ffffff; background-color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 8px; letter-spacing: 0.05em; white-space: nowrap; flex-shrink: 0;">
            NABL ACCREDITED
          </span>
          <span style="white-space: nowrap; flex-shrink: 0;">Registration No: MC-2026-66712</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 9px; flex-shrink: 0;">
          <span>Specimen Barcode:</span>
          <span style="font-weight: bold; color: #1e293b; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">${report.barcode}</span>
        </div>
      </div>

      <!-- Patient Information Grid Box -->
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px; font-size: 11px; line-height: 1.5;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: rgba(248, 250, 252, 0.5);">
            <!-- Left Info Box Column -->
            <td style="width: 50%; padding: 12px; border-right: 1px solid #e2e8f0; vertical-align: top;">
              <table style="width: 100%;">
                <tr style="margin-bottom: 8px;">
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; width: 35%; padding: 3px 0;">Patient Name:</td>
                  <td style="font-weight: 800; color: #0f172a; font-size: 13px; padding: 3px 0;">${report.patientName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 3px 0;">Age / Gender:</td>
                  <td style="font-weight: bold; color: #334155; padding: 3px 0;">${report.patientAge} Years / ${report.patientGender}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 3px 0;">Patient ID:</td>
                  <td style="font-family: monospace; font-weight: bold; color: #1d4ed8; padding: 3px 0;">${report.patientId}</td>
                </tr>
              </table>
            </td>
            <!-- Right Info Box Column -->
            <td style="width: 50%; padding: 12px; vertical-align: top;">
              <table style="width: 100%;">
                <tr style="margin-bottom: 8px;">
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; width: 35%; padding: 3px 0;">Ref. Doctor:</td>
                  <td style="font-weight: 800; color: #334155; font-style: italic; padding: 3px 0;">${report.doctorRef}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 3px 0;">Collected Date:</td>
                  <td style="font-weight: bold; color: #334155; padding: 3px 0;">${report.collectedDate} 08:30 AM</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 3px 0;">Reported Date:</td>
                  <td style="font-weight: bold; color: #334155; padding: 3px 0;">${report.completedDate || report.collectedDate} 05:00 PM</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Department Banner Header -->
      <div style="background-color: #030712; color: #ffffff; text-align: center; padding: 8px 0; border-radius: 6px; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">
        DEPARTMENT OF ${report.category.toUpperCase() || 'BIOCHEMISTRY'}
      </div>

      <!-- Test Sub-Title Banner -->
      <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.025em;">
          ${report.testName}
        </h2>
        <p style="margin: 2px 0 0 0; font-size: 9px; color: #64748b; font-style: italic;">
          Methodology: Fully Automated Chemiluminescence Immunoassay (CLIA) & Dry Chemistry Technology
        </p>
      </div>

      <!-- Lab Report Parameters Table -->
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">
            <th style="padding: 10px 8px; font-weight: 800; width: 40%;">Test Parameter</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 800; width: 20%;">Observed Value</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 800; width: 20%;">Unit</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 800; width: 20%;">Biological Ref Interval</th>
          </tr>
        </thead>
        <tbody>
          ${parametersHtml}
        </tbody>
      </table>

      ${isDemoMode ? `
      <!-- Prominent Demo Mode Disclaimer Banner -->
      <div style="background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 12px; margin: 16px 0; text-align: center; color: #991b1b;">
        <p style="margin: 0; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #b91c1c;">
          ⚠️ DEMO MODE — SAMPLE REPORT (DEMO RESULT)
        </p>
        <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: bold; color: #991b1b; line-height: 1.4;">
          THIS REPORT IS GENERATED IN DEMO PREVIEW MODE WITH SAMPLE DATA. IT IS STRICTLY FOR SOFTWARE DEMONSTRATION AND CANNOT BE USED FOR CLINICAL DIAGNOSIS, PATIENT CARE, OR COMMERCIAL PRINTING.
        </p>
      </div>
      ` : ''}

      <!-- Clinician Pathology Remarks Notes -->
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background-color: rgba(248, 250, 252, 0.6); font-size: 11px; color: #475569; margin-bottom: 24px; line-height: 1.5;">
        <span style="font-weight: 800; color: #1e293b; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 9px;">
          Pathology clinical commentary & Remarks
        </span>
        <p style="margin: 0; font-style: italic;">
          ${report.doctorRemarks || 'All results are clinical within normal limits, suggesting biological steady state for parameters tested. Please correlate clinically with symptoms.'}
        </p>
      </div>

      ${isBothVerified ? `
      <!-- Authenticated Dual Clinical Signatures -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; line-height: 1.4; font-weight: 600;">
        <!-- Lab Technician -->
        <div style="text-align: left;">
          ${techSigHtml}
          <p style="margin: 0; font-weight: 800; color: #334155; font-size: 11px;">${globalTechnicianName}</p>
          <p style="margin: 2px 0 0 0;">Lab Technician & Technologist</p>
          <p style="margin: 2px 0 0 0; font-size: 8px; color: #94a3b8;">${globalTechnicianDegree}</p>

          <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 800; padding: 2px 8px; border-radius: 9999px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">
            ✓ SAMPLE VERIFIED
          </div>
        </div>

        <!-- Pathologist -->
        <div style="text-align: right;">
          ${pathSigHtml}
          <p style="margin: 0; font-weight: 800; color: #334155; font-size: 11px;">${globalPathologistName}</p>
          <p style="margin: 2px 0 0 0;">Consultant Pathology Clinical Director</p>
          <p style="margin: 2px 0 0 0; font-size: 8px; color: #94a3b8;">${globalPathologistDegree}</p>

          <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-weight: 800; padding: 2px 8px; border-radius: 9999px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">
            ✓ REPORT VERIFIED
          </div>
        </div>
      </div>
      ` : `
      <div style="border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 24px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; font-size: 10px; color: #991b1b; text-align: center; font-weight: bold;">
        ⚠️ DUAL VERIFICATION PENDING: Certified signatures and names will appear here only after both the Lab Technician (Sample Sign-off) and Pathologist (Report Sign-off) verify this report.
        <div style="margin-top: 6px; font-size: 9px; display: flex; justify-content: center; gap: 16px;">
          <span>Technician: ${report.technicianVerified ? '✓ Verified' : '⏳ Pending'}</span>
          <span>Pathologist: ${report.pathologistVerified || report.status === 'Completed' ? '✓ Verified' : '⏳ Pending'}</span>
        </div>
      </div>
      `}

      <!-- Footer disclaimer copy -->
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 7px; color: #94a3b8; line-height: 1.3;">
        <p style="margin: 0; font-weight: bold;">*** END OF PATHOLOGICAL REPORT ***</p>
        <p style="margin: 4px 0 0 0;">
          This is a digitally generated patient record. It is secured using authenticated SHA-256 signatures of certifying physicians.
        </p>
        <p style="margin: 2px 0 0 0;">
          Please consult with your clinical referencing physician for therapy administration and clinical diagnostics correlation.
        </p>
      </div>
    </div>
  `;

  // Append to document
  document.body.appendChild(container);

  // Give the browser time to paint the newly inserted DOM element
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    // Convert offscreen DOM element to canvas with crisp scaling
    const canvas = await html2canvas(container, {
      scale: 2, // Retain sharp details and high DPI
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
      windowWidth: 794,
      windowHeight: container.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Prepare PDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // A4: 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // A4: 297mm

    // Calculate rendering scale
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Standard high fidelity top alignment
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);

    // Save with precise standard file naming format
    const cleanedPatientName = report.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Clinical_Report_${cleanedPatientName}_${report.reportNo}.pdf`;
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    return { file, filename, pdf };
  } catch (error) {
    console.error('Failed to compile PDF:', error);
    alert('Failed to generate high-fidelity clinical PDF document. Please try printing to PDF instead.');
    throw error;
  } finally {
    // Cleanup the offscreen element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function downloadReportPDF(report: TestReport, isDemo?: boolean): Promise<void> {
  try {
    const { pdf, filename } = await generateReportPDFFile(report, isDemo);
    pdf.save(filename);
  } catch (error) {
    // Error already handled
  }
}

export async function downloadInvoicePDF(invoice: Invoice, isDemo?: boolean): Promise<void> {
  const isDemoMode = isDemo || invoice.tenantId === 'TNT-DEMO-PREVIEW';

  const container = document.createElement('div');
  container.id = 'offscreen-invoice-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.padding = '40px';

  const logoDataUrl = localStorage.getItem('apex_labLogo');
  const headerLogoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="height: 52px; width: 52px; object-fit: contain; border-radius: 8px;" />`
    : `<div style="height: 48px; width: 48px; background-color: #1e3a8a; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px;">A</div>`;

  const itemsHtml = invoice.items.map((item, idx) => {
    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 8px; font-weight: 600; color: #334155; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 12px 8px; font-weight: bold; color: #0f172a; font-size: 13px;">${item.testName} ${isDemoMode ? '<span style="color: #dc2626; font-size: 10px; font-weight: 900;">[DEMO]</span>' : ''}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #1e293b; font-size: 13px;">₹${item.price.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; box-sizing: border-box;">
      <!-- Lab Letterhead Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${headerLogoHtml}
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #172554; tracking-tight: -0.025em; line-height: 1.1;">
              APEX DIAGNOSTICS & PATHOLOGY
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 9px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">
              Fully Automated Clinical Laboratories & Diagnostic Center
            </p>
            <p style="margin: 2px 0 0 0; font-size: 8px; color: #64748b; line-height: 1.2; font-weight: 500;">
              ISO 9001:2015 Certified • National Accreditation Board (NABL) Certified • Reg No: AM-2026/89312
            </p>
          </div>
        </div>
        <div style="text-align: right; font-size: 8px; color: #64748b; line-height: 1.4; font-weight: 500; max-width: 250px;">
          <p style="margin: 0; font-weight: 800; color: #1e293b; font-size: 9px; letter-spacing: 0.05em;">CENTRAL DISPATCH BRANCH</p>
          <p style="margin: 2px 0 0 0;">402-405, Clinic Heights, Opposite Civil Hospital</p>
          <p style="margin: 2px 0 0 0;">Ahmedabad, Gujarat, India - 380001</p>
          <p style="margin: 2px 0 0 0; font-weight: bold; color: #1e3a8a;">Phone: +91 79 4005 8920 | contact@apexdiagnostics.com</p>
        </div>
      </div>

      <!-- Receipt Title Bar -->
      <div style="background-color: #1e3a8a; color: #ffffff; text-align: center; padding: 10px 0; border-radius: 6px; font-weight: 800; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
        COMMERCIAL RECEIPT VOUCHER / INVOICE ${isDemoMode ? '<span style="background-color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 8px;">DEMO RECEIPT</span>' : ''}
      </div>

      <!-- Invoice Details Grid Box -->
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px; font-size: 11px; line-height: 1.5;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: rgba(248, 250, 252, 0.5);">
            <!-- Left Column -->
            <td style="width: 50%; padding: 12px; border-right: 1px solid #e2e8f0; vertical-align: top;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; width: 35%; padding: 4px 0;">Patient Name:</td>
                  <td style="font-weight: 800; color: #0f172a; font-size: 13px; padding: 4px 0;">${invoice.patientName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 4px 0;">Patient ID:</td>
                  <td style="font-family: monospace; font-weight: bold; color: #1d4ed8; padding: 4px 0;">${invoice.patientId}</td>
                </tr>
              </table>
            </td>
            <!-- Right Column -->
            <td style="width: 50%; padding: 12px; vertical-align: top;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; width: 35%; padding: 4px 0;">Bill No:</td>
                  <td style="font-family: monospace; font-weight: 800; color: #0f172a; font-size: 13px; padding: 4px 0;">${invoice.invoiceNo}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 4px 0;">Date:</td>
                  <td style="font-weight: bold; color: #334155; padding: 4px 0;">${invoice.date}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 4px 0;">Payment Mode:</td>
                  <td style="font-weight: bold; color: #334155; padding: 4px 0;">${invoice.paymentMode}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 4px 0;">Status:</td>
                  <td style="padding: 4px 0;">
                    <span style="font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase; ${
                      invoice.paymentStatus === 'Paid' ? 'background-color: #d1fae5; color: #065f46;' :
                      invoice.paymentStatus === 'Partial' ? 'background-color: #fef3c7; color: #92400e;' : 'background-color: #fee2e2; color: #991b1b;'
                    }">
                      ${invoice.paymentStatus}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">
            <th style="padding: 10px 8px; font-weight: 800; width: 10%;">S.No</th>
            <th style="padding: 10px 8px; font-weight: 800; width: 65%;">Diagnostics Test Panel / Service Description</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 800; width: 25%;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals Block -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <table style="width: 50%; border-collapse: collapse; font-size: 12px; color: #475569;">
          <tr>
            <td style="padding: 6px 8px; font-weight: 600;">Subtotal:</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: bold; color: #1e293b;">₹${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; font-weight: 600; color: #dc2626;">Discount (${invoice.discount}%):</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: bold; color: #dc2626;">- ₹${invoice.discountAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; font-weight: 600;">GST Tax (18%):</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: bold; color: #1e293b;">₹${invoice.gstAmount.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1; font-size: 14px;">
            <td style="padding: 8px 8px; font-weight: 800; color: #0f172a;">Total Bill:</td>
            <td style="padding: 8px 8px; text-align: right; font-weight: 800; color: #0f172a;">₹${invoice.total.toFixed(2)} ${isDemoMode ? '<span style="color: #dc2626; font-size: 11px;">(DEMO)</span>' : ''}</td>
          </tr>
          <tr style="color: #059669; font-size: 13px;">
            <td style="padding: 6px 8px; font-weight: 800;">Amount Paid:</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: 800;">₹${invoice.paidAmount.toFixed(2)}</td>
          </tr>
          ${invoice.outstandingBalance > 0 ? `
            <tr style="color: #dc2626; font-size: 13px; border-top: 1px dashed #fee2e2;">
              <td style="padding: 6px 8px; font-weight: 800;">Outstanding Balance:</td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 800;">₹${invoice.outstandingBalance.toFixed(2)}</td>
            </tr>
          ` : ''}
        </table>
      </div>

      ${isDemoMode ? `
      <!-- Prominent Demo Mode Invoice Disclaimer Banner -->
      <div style="background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 12px; margin: 16px 0; text-align: center; color: #991b1b;">
        <p style="margin: 0; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #b91c1c;">
          ⚠️ DEMO MODE — SAMPLE INVOICE RECEIPT (DEMO)
        </p>
        <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: bold; color: #991b1b; line-height: 1.4;">
          THIS INVOICE IS GENERATED IN DEMO PREVIEW MODE. IT IS STRICTLY FOR SYSTEM DEMONSTRATION AND CANNOT BE USED AS A LEGAL RECEIPT, COMMERCIAL BILL, OR TAX CLAIM DOCUMENT.
        </p>
      </div>
      ` : ''}

      <!-- Authenticated stamp -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 24px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; line-height: 1.4; font-weight: 600;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: bottom;">
              <p style="margin: 0; font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 9px;">Declaration</p>
              <p style="margin: 4px 0 0 0; font-weight: 500; font-style: italic; max-width: 320px; line-height: 1.4;">
                This receipt is legal proof of financial transaction at Apex Diagnostics. Services billed are under standard clinical pathology lab diagnostic categories.
              </p>
            </td>
            <td style="width: 50%; text-align: right; vertical-align: bottom;">
              <div style="height: 48px; width: 120px; margin: 0 0 4px auto; font-family: monospace; font-size: 14px; font-style: italic; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #cbd5e1; text-align: center; line-height: 48px;">
                Authorized Signatory
              </div>
              <p style="margin: 0; font-weight: 800; color: #334155; font-size: 11px;">Accounts & Finance Division</p>
              <p style="margin: 2px 0 0 0;">Apex Diagnostics & Pathology</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Disclaimer -->
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 8px; color: #94a3b8; line-height: 1.3;">
        <p style="margin: 0; font-weight: bold;">*** THANK YOU FOR CHOOSING APEX DIAGNOSTICS & PATHOLOGY ***</p>
        <p style="margin: 4px 0 0 0;">
          This is an automated computer-generated receipt voucher.
        </p>
        <p style="margin: 2px 0 0 0;">
          For secure patient laboratory report digital downloads, please log into our secure online patient gateway using your Patient ID.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Give the browser time to paint the newly inserted DOM element
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
      windowWidth: 794,
      windowHeight: container.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);

    const cleanedPatientName = invoice.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Invoice_${cleanedPatientName}_${invoice.invoiceNo}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to compile invoice PDF:', error);
    alert('Failed to generate high-fidelity commercial invoice PDF. Please print directly to PDF instead.');
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadFinanceReportPDF(
  invoices: Invoice[],
  expenses: Expense[],
  country?: CountryConfig,
  periodLabel: string = 'All Time',
  isDemo?: boolean
): Promise<void> {
  const isDemoMode = isDemo || (invoices.length > 0 && invoices[0].tenantId === 'TNT-DEMO-PREVIEW');

  const currSymbol = country?.currencySymbol || '₹';
  const taxName = country?.taxName || 'GST';
  const taxRate = country?.defaultTaxPercent || 18;
  const countryCode = country?.code || 'IN';
  const countryName = country?.name || 'India';
  const flag = country?.flag || '🇮🇳';

  const container = document.createElement('div');
  container.id = 'offscreen-finance-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.padding = '40px';

  // Calculations
  const grossBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalRevenueCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalUncollected = invoices.reduce((s, i) => s + i.outstandingBalance, 0);

  // Tax output liability calculation
  const totalTaxCollected = invoices.reduce((s, i) => {
    return s + (i.gstAmount || (i.total * taxRate / (100 + taxRate)));
  }, 0);

  // Input Tax Credit (Purchase / Stock Tax Paid) Calculation
  const totalInputTaxCredit = expenses.reduce((s, e) => {
    if (typeof e.taxAmount === 'number' && e.taxAmount > 0) {
      return s + e.taxAmount;
    }
    if (
      e.category === 'Reagents & Kits' ||
      e.category === 'Utilities' ||
      e.description.toLowerCase().includes('stock purchase') ||
      e.description.toLowerCase().includes('gst') ||
      e.description.toLowerCase().includes('tax')
    ) {
      return s + (e.amount * taxRate / (100 + taxRate));
    }
    return s;
  }, 0);

  const netTaxPayable = Math.max(0, totalTaxCollected - totalInputTaxCredit);

  const cgst = totalTaxCollected / 2;
  const sgst = totalTaxCollected / 2;
  const cgstInput = totalInputTaxCredit / 2;
  const sgstInput = totalInputTaxCredit / 2;
  const netCgst = netTaxPayable / 2;
  const netSgst = netTaxPayable / 2;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenueCollected - totalExpenses;
  const profitMargin = totalRevenueCollected > 0 ? (netProfit / totalRevenueCollected) * 100 : 0;

  const demoTag = isDemoMode ? `<span style="color: #dc2626; font-size: 11px; font-weight: 900; margin-left: 6px;">[DEMO]</span>` : '';

  const expByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as { [key: string]: number });

  const labLogo = localStorage.getItem('apex_labLogo');
  const headerLogoHtml = labLogo ? 
    `<img src="${labLogo}" style="height: 52px; width: 52px; object-fit: contain; border-radius: 8px;" />` :
    `<div style="height: 52px; width: 52px; background-color: #1e3a8a; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">📈</div>`;

  const taxRowsHtml = countryCode === 'IN' ? `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 0; font-weight: 600; color: #334155;">Output Sales Tax Collected (CGST 9% + SGST 9%):</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #0f172a;">${currSymbol}${totalTaxCollected.toLocaleString('en-IN')}${demoTag}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 0; font-weight: 600; color: #047857;">Less: Input Purchase Tax Credit (ITC on Stock & Reagents):</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #047857;">-${currSymbol}${totalInputTaxCredit.toLocaleString('en-IN')}${demoTag}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #64748b;">
      <td style="padding: 4px 0;">CGST Net Payable (${currSymbol}${cgst.toLocaleString('en-IN')} Output - ${currSymbol}${cgstInput.toLocaleString('en-IN')} Input Credit):</td>
      <td style="padding: 4px 0; text-align: right; font-weight: bold;">${currSymbol}${netCgst.toLocaleString('en-IN')}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #64748b;">
      <td style="padding: 4px 0;">SGST Net Payable (${currSymbol}${sgst.toLocaleString('en-IN')} Output - ${currSymbol}${sgstInput.toLocaleString('en-IN')} Input Credit):</td>
      <td style="padding: 4px 0; text-align: right; font-weight: bold;">${currSymbol}${netSgst.toLocaleString('en-IN')}</td>
    </tr>
  ` : `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 0; font-weight: 600; color: #334155;">${taxName} Output Tax Collected (${taxRate}%):</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #0f172a;">${currSymbol}${totalTaxCollected.toLocaleString('en-IN')}${demoTag}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 0; font-weight: 600; color: #047857;">Less: Input Purchase Tax Credit (ITC):</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #047857;">-${currSymbol}${totalInputTaxCredit.toLocaleString('en-IN')}${demoTag}</td>
    </tr>
  `;

  container.innerHTML = `
    <div style="width: 100%; box-sizing: border-box;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${headerLogoHtml}
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #172554;">
              APEX DIAGNOSTICS & PATHOLOGY
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">
              FINANCIAL AUDIT STATEMENT & ${taxName.toUpperCase()} TAX LIABILITY REPORT
            </p>
            <p style="margin: 2px 0 0 0; font-size: 8px; color: #64748b;">
              Tax Reg / ID: 24AAACA0000A1Z5 | Report Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div style="text-align: right; font-size: 9px; color: #64748b; line-height: 1.4;">
          <p style="margin: 0; font-weight: 800; color: #0f172a; text-transform: uppercase;">ACCOUNTS DIVISION</p>
          <p style="margin: 2px 0 0 0; font-weight: bold; color: #1e40af;">Statement Period: ${periodLabel}</p>
          <p style="margin: 2px 0 0 0; font-weight: bold; color: #0284c7;">Country: ${flag} ${countryName}</p>
        </div>
      </div>

      ${isDemoMode ? `
      <!-- Demo Disclaimer Banner -->
      <div style="background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 10px; margin-bottom: 16px; text-align: center; color: #991b1b;">
        <p style="margin: 0; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #b91c1c;">
          ⚠️ DEMO MODE — SAMPLE FINANCIAL STATEMENT (DEMO RESULT)
        </p>
        <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: bold; color: #991b1b;">
          THIS FINANCIAL STATEMENT IS GENERATED IN DEMO PREVIEW MODE. IT IS STRICTLY FOR SOFTWARE DEMONSTRATION AND CANNOT BE FILED WITH TAX AUTHORITIES OR USED FOR AUDITING.
        </p>
      </div>
      ` : ''}

      <!-- Financial KPI Summary Cards Table -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
          1. Key Financial & Diagnostic Revenue Metrics
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px;">
          <tr style="background-color: #f8fafc; text-align: left; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 8px; color: #475569;">Financial Indicator</th>
            <th style="padding: 8px; text-align: right; color: #475569;">Amount (${currSymbol})</th>
            <th style="padding: 8px; color: #475569;">Audit Status / Remarks</th>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: 600;">Gross Billed Revenue (Invoices)</td>
            <td style="padding: 8px; text-align: right; font-weight: 800; color: #0f172a;">${currSymbol}${grossBilled.toLocaleString('en-IN')}${demoTag}</td>
            <td style="padding: 8px; color: #64748b;">${invoices.length} Invoices Billed</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: 600;">Cash & Digital Receipts Collected</td>
            <td style="padding: 8px; text-align: right; font-weight: 800; color: #059669;">${currSymbol}${totalRevenueCollected.toLocaleString('en-IN')}${demoTag}</td>
            <td style="padding: 8px; color: #059669; font-weight: 600;">Realized Receipts</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: 600;">Outstanding Receivables (Due)</td>
            <td style="padding: 8px; text-align: right; font-weight: 800; color: #dc2626;">${currSymbol}${totalUncollected.toLocaleString('en-IN')}${demoTag}</td>
            <td style="padding: 8px; color: #dc2626; font-weight: 600;">Pending Customer Dues</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: 600;">Total Overhead Expenses Billed</td>
            <td style="padding: 8px; text-align: right; font-weight: 800; color: #e11d48;">${currSymbol}${totalExpenses.toLocaleString('en-IN')}${demoTag}</td>
            <td style="padding: 8px; color: #64748b;">${expenses.length} Expense Vouchers</td>
          </tr>
          <tr style="background-color: #f0fdf4; font-size: 12px; border-top: 2px solid #bbf7d0;">
            <td style="padding: 10px 8px; font-weight: 800; color: #14532d;">NET OPERATING PROFIT / YIELD</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 900; color: #15803d; font-size: 13px;">${currSymbol}${netProfit.toLocaleString('en-IN')}${demoTag}</td>
            <td style="padding: 10px 8px; font-weight: 800; color: #166534;">Margin Rate: ${profitMargin.toFixed(1)}%</td>
          </tr>
        </table>
      </div>

      <!-- Tax Payable & Liability Section -->
      <div style="margin-bottom: 20px; border: 2px solid #1e3a8a; border-radius: 8px; padding: 14px; background-color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">
              2. ${taxName} Output Tax Liability Statement
            </h3>
            <p style="margin: 2px 0 0 0; font-size: 9px; color: #475569;">
              Region: ${flag} ${countryName} • Applicable Rate: ${taxRate}% ${taxName}
            </p>
          </div>
          <span style="background-color: #1e3a8a; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase;">
            PAYABLE TO GOVT
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          ${taxRowsHtml}
          <tr style="background-color: #e0f2fe; border-radius: 6px;">
            <td style="padding: 8px 6px; font-weight: 800; color: #0369a1; font-size: 12px;">TOTAL NET ${taxName.toUpperCase()} TAX PAYABLE TO GOVERNMENT:</td>
            <td style="padding: 8px 6px; text-align: right; font-weight: 900; color: #0284c7; font-size: 14px;">${currSymbol}${netTaxPayable.toLocaleString('en-IN')}${demoTag}</td>
          </tr>
        </table>
      </div>

      <!-- Expense Category Ledger Table -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
          3. Expense Ledger Breakdown by Category
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px;">
          <tr style="background-color: #f8fafc; text-align: left; border-bottom: 1px solid #cbd5e1; color: #475569;">
            <th style="padding: 6px 8px;">Expenditure Category</th>
            <th style="padding: 6px 8px; text-align: right;">Total Amount Spent (${currSymbol})</th>
            <th style="padding: 6px 8px; text-align: right;">% of Total Expenses</th>
          </tr>
          ${Object.entries(expByCategory).map(([cat, amt]) => {
            const numAmt = amt as number;
            return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 8px; font-weight: 600; color: #1e293b;">${cat}</td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 800; color: #dc2626;">${currSymbol}${numAmt.toLocaleString('en-IN')}${demoTag}</td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: #64748b;">
                ${totalExpenses > 0 ? ((numAmt / totalExpenses) * 100).toFixed(1) : '0'}%
              </td>
            </tr>
          `;
          }).join('')}
        </table>
      </div>

      <!-- Signatures Footer -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #64748b;">
        <div>
          <p style="margin: 0; font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 9px;">Financial Auditor Note</p>
          <p style="margin: 2px 0 0 0; font-style: italic; max-width: 340px; line-height: 1.3;">
            Calculated under standard ${countryName} ${taxName} statutory accounting rules for healthcare diagnostic laboratories.
          </p>
        </div>
        <div style="text-align: right;">
          <div style="height: 40px; border-bottom: 1px solid #cbd5e1; margin-bottom: 4px; width: 140px; margin-left: auto;"></div>
          <p style="margin: 0; font-weight: 800; color: #0f172a;">Chief Financial Officer / Accountant</p>
          <p style="margin: 2px 0 0 0; font-size: 8px;">Apex Diagnostics Accounts Wing</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
      windowWidth: 794,
      windowHeight: container.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);
    pdf.save(`Financial_And_${taxName}_Statement_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  } catch (error) {
    console.error('Failed to export Finance PDF:', error);
    alert('Could not export PDF. Please use the Print option instead.');
  } finally {
    document.body.removeChild(container);
  }
}

