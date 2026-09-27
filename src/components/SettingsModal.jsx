import React, { useState } from 'react';
import { X, Download, Upload, Server, Smartphone, Info, CheckCircle2 } from 'lucide-react';
import { exportBackup, importBackup } from '../services/storage';
import { PIPED_INSTANCES, getActiveInstance } from '../services/api';

export default function SettingsModal({ onClose, onReloadData }) {
  const [selectedInstance, setSelectedInstance] = useState(getActiveInstance());
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(false);

  const handleInstanceChange = (e) => {
    const val = e.target.value;
    setSelectedInstance(val);
    localStorage.setItem('musicaflow_custom_instance', val);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = importBackup(content);
        if (ok) {
          setImportSuccess(true);
          setImportError(false);
          if (onReloadData) onReloadData();
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError(true);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-md p-6 max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#FF0033]" />
            <h3 className="font-bold text-white text-lg">Ajustes & Respaldo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 my-4">
          {/* Mobile Install Tip (PWA) */}
          <div className="bg-gradient-to-br from-red-950/40 to-neutral-900 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
              <Smartphone className="w-5 h-5 text-[#FF0033]" />
              Instalar en tu Móvil (PWA)
            </div>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">iPhone (Safari):</strong> Toca el icono de Compartir y selecciona <span className="text-[#FF0033] font-medium">"Añadir a pantalla de inicio"</span>.
              </li>
              <li>
                <strong className="text-white">Android (Chrome):</strong> Toca los tres puntos y elige <span className="text-[#FF0033] font-medium">"Instalar aplicación"</span>.
              </li>
              <li className="text-neutral-400">
                ¡Así tendrás audio en segundo plano con pantalla apagada como una app nativa!
              </li>
            </ul>
          </div>

          {/* Backup & Restore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Tus Playlists y Favoritos</h4>
            <p className="text-xs text-neutral-400 mb-3">
              Todo se guarda en tu dispositivo a costo $0. Puedes descargar un archivo de copia para pasarlo a tu celular o computadora.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={exportBackup}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-[#FF0033]" />
                Exportar Copia
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                Importar Copia
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4" />
                ¡Copia de seguridad restaurada correctamente!
              </p>
            )}
            {importError && (
              <p className="text-xs text-red-400 mt-2">
                Error al leer el archivo. Asegúrate de que sea un JSON válido.
              </p>
            )}
          </div>

          {/* Stream Server Instance */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-neutral-400" />
              <h4 className="text-sm font-semibold text-white">Servidor Extractor de Audio</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-2">
              Si algún tema tarda en cargar, puedes cambiar de nodo extractor:
            </p>
            <select
              value={selectedInstance}
              onChange={handleInstanceChange}
              className="w-full bg-white/10 text-white text-xs rounded-xl p-3 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#FF0033]"
            >
              {PIPED_INSTANCES.map((inst) => (
                <option key={inst} value={inst} className="bg-neutral-900 text-white">
                  {inst.replace('https://', '')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
