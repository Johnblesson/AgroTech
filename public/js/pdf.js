 // Function to generate PDF and return the Blob
 async function generatePDF() {
    const element = document.getElementById('content');
    const opt = {
        margin:       1,
        filename:     'homehubsl-apartment-info.pdf.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Generate PDF and return as Blob
    const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
    return pdfBlob;
}

// Export as PDF
document.getElementById('exportBtn').addEventListener('click', async () => {
    const element = document.getElementById('content');
    const opt = {
        margin:       1,
        filename:     'homehubsl-apartment-info.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
});

// Share PDF file
document.getElementById('shareBtn').addEventListener('click', async () => {
    try {
        const pdfBlob = await generatePDF();
        const pdfFile = new File([pdfBlob], 'page-content.pdf', { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                files: [pdfFile],
                title: 'My Content',
                text: 'Check out this content!'
            });
            console.log('PDF shared successfully');
        } else {
            alert('Sharing files is not supported in your browser.');
        }
    } catch (err) {
        console.error('Error sharing PDF:', err);
    }
});