import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { State, City, Ward, getAQILabel, getHealthAdvisory, pollutionSources } from '@/data/pollutionData';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export function generateNationalPDF(states: State[], nationalStats: any): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(24, 39, 56);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VayuWatch', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('National Air Quality Report - India', 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, 38);

  // Demo mode indicator
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(pageWidth - 55, 10, 45, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text('DEMO MODE', pageWidth - 50, 18);

  // National Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('National Summary', 14, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['National Average AQI', `${nationalStats.averageAqi} (${getAQILabel(nationalStats.category)})`],
    ['Total States Covered', nationalStats.totalStates.toString()],
    ['Total Cities Monitored', nationalStats.totalCities.toString()],
    ['Most Polluted City', `${nationalStats.worstCity.name} (AQI: ${nationalStats.worstCity.aqi})`],
    ['Cleanest City', `${nationalStats.bestCity.name} (AQI: ${nationalStats.bestCity.aqi})`],
  ];

  autoTable(doc, {
    startY: 65,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 80 },
    },
  });

  // State-wise AQI Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('State-wise Air Quality', 14, doc.lastAutoTable.finalY + 20);

  const stateData = states.map(state => [
    state.name,
    state.code,
    state.aqi.toString(),
    getAQILabel(state.category),
    state.cities.length.toString(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['State', 'Code', 'AQI', 'Category', 'Cities']],
    body: stateData,
    theme: 'striped',
    headStyles: { fillColor: [24, 39, 56], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Pollution Sources
  if (doc.lastAutoTable.finalY < 220) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Pollution Sources Breakdown', 14, doc.lastAutoTable.finalY + 20);

    const sourceData = pollutionSources.map(source => [
      source.name,
      `${source.percentage}%`,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Source', 'Contribution']],
      body: sourceData,
      theme: 'striped',
      headStyles: { fillColor: [24, 39, 56], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `VayuWatch - India Air Quality Monitoring | Standards: CPCB/NCAP | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`VayuWatch_National_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateStatePDF(state: State): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(24, 39, 56);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VayuWatch', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${state.name} Air Quality Report`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);

  // State Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${state.name} Overview`, 14, 60);

  const summary = [
    ['State AQI', `${state.aqi} (${getAQILabel(state.category)})`],
    ['State Code', state.code],
    ['Total Cities', state.cities.length.toString()],
    ['Total Population', state.population.toLocaleString('en-IN')],
  ];

  autoTable(doc, {
    startY: 65,
    head: [],
    body: summary,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
    },
  });

  // Cities Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('City-wise Breakdown', 14, doc.lastAutoTable.finalY + 20);

  const cityData = state.cities.map(city => [
    city.name,
    city.aqi.toString(),
    getAQILabel(city.category),
    city.wards.length.toString(),
    city.stationCount.toString(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['City', 'AQI', 'Category', 'Wards', 'Stations']],
    body: cityData,
    theme: 'striped',
    headStyles: { fillColor: [24, 39, 56], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Health Advisory
  const advisory = getHealthAdvisory(state.category);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Advisory', 14, doc.lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [],
    body: [
      ['General', advisory.general],
      ['Sensitive Groups', advisory.sensitive],
      ['Outdoor Activities', advisory.outdoor],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
    },
  });

  doc.save(`VayuWatch_${state.name}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateCityPDF(city: City): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(24, 39, 56);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VayuWatch', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`${city.name}, ${city.state} - Air Quality Report`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);

  // City Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('City Overview', 14, 60);

  autoTable(doc, {
    startY: 65,
    head: [],
    body: [
      ['City AQI', `${city.aqi} (${getAQILabel(city.category)})`],
      ['Population', city.population.toLocaleString('en-IN')],
      ['Monitoring Stations', city.stationCount.toString()],
      ['Total Wards', city.wards.length.toString()],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  // Pollutant Data
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Pollutant Concentrations', 14, doc.lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Pollutant', 'Value', 'CPCB Limit', 'Status']],
    body: [
      ['PM2.5', `${city.pollutants.pm25} µg/m³`, '60 µg/m³', city.pollutants.pm25 > 60 ? 'Exceeds' : 'Safe'],
      ['PM10', `${city.pollutants.pm10} µg/m³`, '100 µg/m³', city.pollutants.pm10 > 100 ? 'Exceeds' : 'Safe'],
      ['NO₂', `${city.pollutants.no2} µg/m³`, '80 µg/m³', city.pollutants.no2 > 80 ? 'Exceeds' : 'Safe'],
      ['SO₂', `${city.pollutants.so2} µg/m³`, '80 µg/m³', city.pollutants.so2 > 80 ? 'Exceeds' : 'Safe'],
      ['CO', `${city.pollutants.co} mg/m³`, '4 mg/m³', city.pollutants.co > 4 ? 'Exceeds' : 'Safe'],
      ['O₃', `${city.pollutants.o3} µg/m³`, '100 µg/m³', city.pollutants.o3 > 100 ? 'Exceeds' : 'Safe'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [24, 39, 56], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Ward Data
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Ward-wise Breakdown', 14, doc.lastAutoTable.finalY + 20);

  const wardData = city.wards.map(ward => [
    ward.name,
    ward.aqi.toString(),
    getAQILabel(ward.category),
    ward.dominantSource,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Ward', 'AQI', 'Category', 'Main Source']],
    body: wardData,
    theme: 'striped',
    headStyles: { fillColor: [24, 39, 56], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`VayuWatch_${city.name}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateCSV(data: any[], filename: string): void {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function generateNationalCSV(states: State[]): void {
  const data: any[] = [];
  
  states.forEach(state => {
    state.cities.forEach(city => {
      city.wards.forEach(ward => {
        data.push({
          State: state.name,
          StateCode: state.code,
          StateAQI: state.aqi,
          City: city.name,
          CityAQI: city.aqi,
          Ward: ward.name,
          WardAQI: ward.aqi,
          Category: getAQILabel(ward.category),
          PM25: ward.pollutants.pm25,
          PM10: ward.pollutants.pm10,
          NO2: ward.pollutants.no2,
          SO2: ward.pollutants.so2,
          CO: ward.pollutants.co,
          O3: ward.pollutants.o3,
          DominantSource: ward.dominantSource,
        });
      });
    });
  });

  generateCSV(data, 'VayuWatch_National_Data');
}
