import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Cloud, Server, ChevronRight, CheckCircle2, AlertTriangle, Key, Cpu, Zap, Search, Loader2 } from 'lucide-react';
import { PaperProject, AISettings, HealthStatus, AIProviderInfo } from '../types';
import AIGateway, { AI_PROVIDERS } from '../services/aiGateway';
import { encryptData } from '../utils/crypto';

interface AISetupWizardProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onComplete: (readiness: 'validated' | 'simulated') => void;
  passcodeHash: string;
}

export default function AISetupWizard({ project, updateProject, onComplete, passcodeHash }: AISetupWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [settings, setSettings] = useState<AISettings>(project.aiSettings || { provider: 'auto', fallbackOrder: [] });
  const [isDetecting, setIsDetecting] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [healthResults, setHealthResults] = useState<Record<string, HealthStatus>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Step 1: Detect local servers on mount
  useEffect(() => {
    const detectLocal = async () => {
      try {
        const results = await AIGateway.detectLocalServers();
        const autoSelected = [];
        if (results.ollama.status === 'online') autoSelected.push('ollama');
        if (results.custom.status === 'online') autoSelected.push('custom');
        
        if (autoSelected.length > 0) {
          setSelectedProviders(prev => Array.from(new Set([...prev, ...autoSelected])));
        }
        setHealthResults(prev => ({ ...prev, ...results }));
      } catch (e) {
        console.error("Failed to detect local servers", e);
      } finally {
        setIsDetecting(false);
      }
    };
    detectLocal();
  }, []);

  const handleProviderToggle = (id: string) => {
    setSelectedProviders(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSettingChange = (provider: string, field: string, value: string) => {
    // We update local state, and encrypt keys before saving
    let finalValue = value;
    if (field.toLowerCase().includes('apikey')) {
      finalValue = encryptData(value, passcodeHash);
    }
    
    setSettings(prev => ({
      ...prev,
      [`${provider}${field}`]: finalValue
    }));
  };

  const testConnection = async (providerId: string) => {
    setIsTesting(true);
    try {
      const result = await AIGateway.healthCheckProvider(providerId, settings);
      setHealthResults(prev => ({ ...prev, [providerId]: result }));
      
      // If Ollama is online, fetch models
      if (providerId === 'ollama' && result.status === 'online') {
        const models = await AIGateway.getOllamaModels(settings.ollamaEndpoint);
        if (models.length > 0 && !settings.ollamaModel) {
          setSettings(prev => ({ ...prev, ollamaModel: models[0] }));
        }
      }
    } catch (e) {
      setHealthResults(prev => ({ 
        ...prev, 
        [providerId]: { provider: providerId, status: 'offline', error: 'Connection failed' } 
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const runFinalValidation = async () => {
    setIsTesting(true);
    try {
      // Create a test settings object with only selected providers
      const testSettings = { ...settings, fallbackOrder: selectedProviders };
      const results = await AIGateway.healthCheckAll(testSettings);
      setHealthResults(prev => ({ ...prev, ...results }));
      
      // Determine overall readiness
      const onlineCount = selectedProviders.filter(p => results[p]?.status === 'online').length;
      
      const newSettings: AISettings = {
        ...testSettings,
        providerHealth: results,
        aiReadiness: onlineCount > 0 ? 'validated' : 'simulated'
      };
      
      updateProject({ aiSettings: newSettings });
      setSettings(newSettings);
      setStep(3);
    } catch (e) {
      console.error("Validation failed", e);
    } finally {
      setIsTesting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Initialize AI Intelligence</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          The Doctoral Assistant requires an AI engine to analyze your dissertation and draft the journal article. 
          Select one or more providers below. We will automatically route requests to the best available model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cloud Providers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cloud className="text-blue-400" /> Cloud AI Providers
          </h3>
          <div className="grid gap-3">
            {AI_PROVIDERS.filter(p => p.type === 'cloud').map(provider => (
              <div 
                key={provider.id}
                onClick={() => handleProviderToggle(provider.id)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                  selectedProviders.includes(provider.id) 
                    ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl bg-slate-900 p-2 rounded-lg">{provider.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{provider.name}</h4>
                      {selectedProviders.includes(provider.id) && (
                        <CheckCircle2 className="text-blue-500 w-5 h-5 animate-scale-in" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{provider.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
                        {provider.pricingTier === 'free' ? 'Free Tier' : provider.pricingTier === 'freemium' ? 'Freemium' : 'API Key Req'}
                      </span>
                      {provider.id === 'server' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Servers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Server className="text-emerald-400" /> Local AI Servers
          </h3>
          <div className="grid gap-3">
            {AI_PROVIDERS.filter(p => p.type === 'local').map(provider => {
              const isDetected = healthResults[provider.id]?.status === 'online';
              return (
                <div 
                  key={provider.id}
                  onClick={() => handleProviderToggle(provider.id)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    selectedProviders.includes(provider.id) 
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl bg-slate-900 p-2 rounded-lg">{provider.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{provider.name}</h4>
                        {selectedProviders.includes(provider.id) && (
                          <CheckCircle2 className="text-emerald-500 w-5 h-5 animate-scale-in" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{provider.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> 100% Private
                        </span>
                        {isDetecting ? (
                          <span className="text-[10px] flex items-center gap-1 text-slate-400">
                            <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                          </span>
                        ) : isDetected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Detected
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-800">
        <p className="text-sm text-slate-400">
          Selected: <span className="font-semibold text-white">{selectedProviders.length} providers</span>
        </p>
        <button
          onClick={() => setStep(2)}
          disabled={selectedProviders.length === 0}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          Configure Providers <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selected = AI_PROVIDERS.filter(p => selectedProviders.includes(p.id));
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Configure Connections</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Provide the necessary API keys or endpoint URLs for your selected AI engines. 
            Keys are XOR-encrypted locally and never stored in plain text.
          </p>
        </div>

        <div className="grid gap-6 max-w-3xl mx-auto">
          {selected.map(provider => {
            const health = healthResults[provider.id];
            
            return (
              <div key={provider.id} className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                  </div>
                  {health && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      health.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      health.status === 'offline' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {health.status === 'online' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {health.status.toUpperCase()}
                      {health.latencyMs && <span className="ml-1 opacity-75">({health.latencyMs}ms)</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* API Key Input for Cloud */}
                  {provider.requiresApiKey && provider.id !== 'server' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" /> API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[provider.id] ? "text" : "password"}
                          placeholder={`Enter ${provider.name} API Key`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                          onChange={(e) => handleSettingChange(provider.id, 'ApiKey', e.target.value)}
                        />
                        <button 
                          onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                        >
                          {showKeys[provider.id] ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Endpoint Input for Local */}
                  {provider.type === 'local' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Server className="w-4 h-4 text-slate-400" /> Server Endpoint URL
                      </label>
                      <input
                        type="text"
                        placeholder={provider.id === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234/v1'}
                        value={(settings as any)[provider.id + 'Endpoint'] || (provider.id === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234/v1')}
                        onChange={(e) => handleSettingChange(provider.id, 'Endpoint', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Model Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-slate-400" /> Default Model
                      </label>
                      <select
                        value={(settings as any)[provider.id + 'Model'] || provider.defaultModel}
                        onChange={(e) => handleSettingChange(provider.id, 'Model', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 appearance-none text-sm"
                      >
                        {health?.models?.length ? (
                          health.models.map((m: string) => <option key={m} value={m}>{m}</option>)
                        ) : (
                          provider.availableModels.map((m: string) => <option key={m} value={m}>{m}</option>)
                        )}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => testConnection(provider.id)}
                        disabled={isTesting}
                        className="w-full py-2 px-4 rounded-lg font-medium text-sm text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-slate-800 max-w-3xl mx-auto">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
          <button
            onClick={runFinalValidation}
            disabled={isTesting}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            {isTesting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</>
            ) : (
              <>Validate & Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const isReady = settings.aiReadiness === 'validated';
    
    return (
      <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center py-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <div className={`relative w-full h-full rounded-full flex items-center justify-center ${isReady ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-orange-600'}`}>
            {isReady ? <CheckCircle2 className="w-12 h-12 text-white" /> : <AlertTriangle className="w-12 h-12 text-white" />}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isReady ? 'Systems Validated' : 'No Providers Online'}
          </h2>
          <p className="text-slate-400 text-lg">
            {isReady 
              ? "Your AI Gateway is configured and ready. The system will intelligently route requests across your selected models to optimize cost and performance."
              : "We couldn't verify a connection to any of your selected AI providers. You can proceed, but the system will use a highly limited simulated fallback mode."}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-left">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Gateway Diagnostics</h4>
          <div className="space-y-3">
            {selectedProviders.map(id => {
              const pInfo = AI_PROVIDERS.find(p => p.id === id);
              const status = healthResults[id]?.status || 'offline';
              return (
                <div key={id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{pInfo?.icon}</span>
                    <span className="font-medium text-slate-200">{pInfo?.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {status === 'online' && healthResults[id]?.latencyMs && (
                      <span className="text-xs font-mono text-slate-500">{healthResults[id].latencyMs}ms</span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={() => onComplete(isReady ? 'validated' : 'simulated')}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              isReady 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
            }`}
          >
            {isReady ? 'Launch Research Workspace' : 'Continue with Simulated AI'}
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {!isReady && (
            <button
              onClick={() => setStep(2)}
              className="mt-4 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Return to Configuration
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10">
        {/* Progress Tracker */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map(num => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-500 ${
                  step >= num 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'border-slate-700 text-slate-500 bg-slate-900'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 transition-all duration-500 ${
                    step > num ? 'bg-blue-500' : 'bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl p-8 md:p-12">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
