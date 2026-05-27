import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Lead } from '../types';
import { base44 } from '../lib/base44';

interface ImportLeadsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface DiscardedRow {
  rowNumber: number;
  content: string;
  reason: string;
}

interface ValidRow {
  nome: string;
  telefone: string;
  mapsUrl: string;
  cidade: string;
}

export default function ImportLeadsModal({ onClose, onSuccess }: ImportLeadsModalProps) {
  const [csvText, setCsvText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importReport, setImportReport] = useState<{
    valid: ValidRow[];
    invalid: DiscardedRow[];
    parsed: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Helper to extract city from Google Maps URL
  const extractCityFromMaps = (url: string): string => {
    try {
      // Look for /place/City+Name/... or similar
      const match = url.match(/\/place\/([^/]+)/);
      if (match && match[1]) {
        let cityPart = match[1];
        // Decode and replace + with space
        cityPart = decodeURIComponent(cityPart).replace(/\+/g, ' ');
        // If it includes coordinates or commas, clean it up
        if (cityPart.includes(',')) {
          cityPart = cityPart.split(',')[0];
        }
        if (cityPart.includes('-')) {
          cityPart = cityPart.split('-')[0];
        }
        return cityPart.trim();
      }
    } catch (e) {
      console.error('Error extracting city', e);
    }
    return '';
  };

  const handleParseCsv = (text: string) => {
    setLoading(true);
    // Standardize newlines
    const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (rawLines.length === 0) {
      setImportReport({
        valid: [],
        invalid: [{ rowNumber: 1, content: '', reason: 'O arquivo/conteúdo está vazio.' }],
        parsed: true
      });
      setLoading(false);
      return;
    }

    // Try to detect headers
    const headerLine = rawLines[0];
    
    // Split columns (comma, semicolon or tab)
    let sep = ',';
    if (headerLine.includes(';')) sep = ';';
    else if (headerLine.includes('\t')) sep = '\t';

    const headers = splitCSVLine(headerLine, sep).map(h => h.trim().toLowerCase());
    
    // Find column indexes
    const mapsIdx = headers.findIndex(h => h.includes('link do google maps') || h.includes('maps') || h.includes('link') || h.includes('url'));
    const nomeIdx = headers.findIndex(h => h.includes('nome') || h === 'name' || h === 'cliente');
    const telIdx = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('tel') || h.includes('celular') || h.includes('whatsapp'));
    const cidadeIdx = headers.findIndex(h => h.includes('cidade') || h.includes('city') || h.includes('localidade'));

    const invalid: DiscardedRow[] = [];
    const valid: ValidRow[] = [];

    // Helper to safely parse CSV line taking quotes into account
    function splitCSVLine(line: string, separator: string): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    }

    // If headers themselves don't exist or are missing primary fields
    if (mapsIdx === -1 || nomeIdx === -1 || telIdx === -1) {
      // Show info that we expect headers
      invalid.push({
        rowNumber: 1,
        content: headerLine,
        reason: `Cabeçalhos inválidos. Certifique-se de incluir exatamente as colunas: 'Link do Google Maps', 'Nome' e 'Telefone'. Cabeçalhos encontrados: ${headers.join(', ')}`
      });
    }

    const startRow = (mapsIdx !== -1 && nomeIdx !== -1 && telIdx !== -1) ? 1 : 0;

    for (let i = startRow; i < rawLines.length; i++) {
      const line = rawLines[i];
      const cols = splitCSVLine(line, sep);
      
      // Determine columns using indices or relative position if headers weren't found
      let mIdx = mapsIdx !== -1 ? mapsIdx : 0;
      let nIdx = nomeIdx !== -1 ? nomeIdx : 1;
      let tIdx = telIdx !== -1 ? telIdx : 2;
      let cIdx = cidadeIdx !== -1 ? cidadeIdx : 3;

      let rawMaps = cols[mIdx]?.trim() || '';
      let rawNome = cols[nIdx]?.trim() || '';
      let rawTelefone = cols[tIdx]?.trim() || '';
      let rawCidade = cIdx !== -1 ? (cols[cIdx]?.trim() || '') : '';

      const rowNumber = i + 1;

      // Validate mandatory fields
      if (!rawNome) {
        invalid.push({
          rowNumber,
          content: line,
          reason: "A coluna 'Nome' está vazia."
        });
        continue;
      }
      if (!rawTelefone) {
        invalid.push({
          rowNumber,
          content: line,
          reason: "A coluna 'Telefone' está vazia."
        });
        continue;
      }
      if (!rawMaps) {
        invalid.push({
          rowNumber,
          content: line,
          reason: "A coluna 'Link do Google Maps' está vazia."
        });
        continue;
      }
      if (!rawMaps.startsWith('http://') && !rawMaps.startsWith('https://')) {
        invalid.push({
          rowNumber,
          content: line,
          reason: "URL do Google Maps inválida (deve começar com http:// ou https://)."
        });
        continue;
      }

      // Try extraction of city
      let extractedCity = extractCityFromMaps(rawMaps);
      if (!extractedCity) {
        extractedCity = rawCidade || 'São Paulo'; // Fallback to provided city or default
      }

      valid.push({
        nome: rawNome,
        telefone: rawTelefone,
        mapsUrl: rawMaps,
        cidade: extractedCity
      });
    }

    setImportReport({ valid, invalid, parsed: true });
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
        handleParseCsv(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (!importReport || importReport.valid.length === 0) return;

    importReport.valid.forEach(row => {
      const newLead: Lead = {
        id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: row.nome,
        telefone: row.telefone,
        cidade: row.cidade,
        origem: 'Importação CSV',
        campanha: 'Importação CRM',
        status: 'Novo',
        temperatura: 'Morno',
        data_entrada: new Date().toISOString(),
        responsavel: 'Tony',
        foto_url: row.mapsUrl, // Save google maps url in foto_url as requested
        prioridade: false,
        respondido: false
      };
      base44.db.leads.save(newLead);
    });

    onSuccess();
    onClose();
  };

  const exampleCsv = `Link do Google Maps;Nome;Telefone;cidade
https://www.google.com/maps/place/Curitiba+-+PR/;Sérgio Rezende;(41) 99911-2233;Curitiba
https://www.google.com/maps/place/São+Paulo+-+SP/;Márcia Fernandes;(11) 98877-6655;São Paulo`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div 
        id="import-modal-container"
        className="relative flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-red-500" />
            Importar Leads via CSV
          </h2>
          <p className="text-sm text-neutral-400">
            Preencha ou anexe um arquivo CSV válido. Colunas obrigatórias: <strong className="text-white">Link do Google Maps</strong>, <strong className="text-white">Nome</strong> e <strong className="text-white">Telefone</strong>.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!importReport && (
            <>
              {/* Drag n drop container */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
                  dragActive ? 'border-red-500 bg-red-500/10' : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <Upload className="mb-3 h-10 w-10 text-neutral-500" />
                <p className="text-sm text-neutral-300">
                  Arraste e solte o arquivo CSV aqui ou{' '}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-red-500 hover:underline font-medium"
                  >
                    procure nos seus arquivos
                  </button>
                </p>
                <p className="mt-1 text-xs text-neutral-500">Apenas arquivos .csv ou .txt delimitados</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Textarea direct input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400">Ou cole o conteúdo CSV abaixo:</label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Link do Google Maps;Nome;Telefone&#10;https://www.google.com/maps/place/São+Paulo;João Goulart;(11) 98888-7777"
                  className="h-36 w-full rounded-md border border-neutral-800 bg-neutral-900/50 p-3 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* CSV Example display */}
              <div className="rounded-lg bg-neutral-900/80 p-3 border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-1">
                  <Info className="h-4 w-4 text-neutral-400" />
                  Estrutura recomendada do cabeçalho (delimitado por ponto e vírgula):
                </div>
                <pre className="text-[10px] font-mono text-neutral-400 overflow-x-auto whitespace-pre p-2 bg-black/40 rounded">
                  {exampleCsv}
                </pre>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleParseCsv(csvText)}
                  disabled={!csvText.trim() || loading}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Analisar CSV'}
                </button>
              </div>
            </>
          )}

          {importReport && (
            <div className="space-y-4">
              {/* Report summary banner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{importReport.valid.length}</div>
                  <div className="text-xs text-neutral-400">Leads Prontos para Importar</div>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{importReport.invalid.length}</div>
                  <div className="text-xs text-neutral-400 font-medium">Linhas Descartadas</div>
                </div>
              </div>

              {/* Valid lines Preview */}
              {importReport.valid.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Válidos para Importação
                  </h3>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-800 divide-y divide-neutral-800 bg-neutral-900/20">
                    {importReport.valid.map((item, idx) => (
                      <div key={idx} className="p-2 text-xs flex justify-between items-center bg-neutral-950/40">
                        <div>
                          <p className="font-semibold text-white">{item.nome}</p>
                          <p className="text-neutral-400 text-[10px] whitespace-nowrap overflow-hidden max-w-[280px]" title={item.mapsUrl}>
                            Maps: {item.mapsUrl}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-300">{item.telefone}</p>
                          <p className="text-[10px] text-red-500">Cidade: {item.cidade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discarded Reports */}
              {importReport.invalid.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Relatório de Linhas Descartadas
                  </h3>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-red-900/30 divide-y divide-neutral-800 bg-red-950/10">
                    {importReport.invalid.map((item, idx) => (
                      <div key={idx} className="p-2.5 text-xs bg-black/20">
                        <div className="flex justify-between font-semibold text-red-400">
                          <span>Linha {item.rowNumber}</span>
                          <span className="text-[10px] bg-red-500/10 px-1.5 rounded">{item.reason}</span>
                        </div>
                        {item.content && (
                          <pre className="mt-1 text-[10px] font-mono text-neutral-400 bg-neutral-900/80 p-1.5 rounded overflow-x-auto whitespace-pre">
                            {item.content}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
                <button
                  onClick={() => setImportReport(null)}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Voltar e Ajustar CSV
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importReport.valid.length === 0}
                    className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    Confirmar Importação de {importReport.valid.length} Leads
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
