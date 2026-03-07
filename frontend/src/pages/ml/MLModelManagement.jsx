import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Play, Activity, CheckCircle, AlertCircle, BarChart3,
  Clock, Database, Zap, RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
};

const modelTypeLabels = {
  random_forest: 'Random Forest',
  gradient_boosting: 'Gradient Boosting',
  xgboost: 'XGBoost',
};

export default function MLModelManagement() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [selectedType, setSelectedType] = useState('random_forest');
  const [mlHealth, setMlHealth] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchModels(); checkHealth(); }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/ml-models');
      setModels(data.data || []);
    } catch {
      toast.error('Failed to load model versions');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const { data } = await api.get('/admin/ml-models/health');
      setMlHealth(data.data);
    } catch {
      setMlHealth({ healthy: false, mlServiceStatus: 'DOWN' });
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      const { data } = await api.post(`/admin/ml-models/train?modelType=${selectedType}`);
      const result = data.data;
      toast.success(`Model ${result.modelType} v${result.version} trained successfully!`);
      fetchModels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Training failed. Ensure ML service is running and there is enough data.');
    } finally {
      setTraining(false);
    }
  };

  const formatMetric = (value) => {
    if (value == null) return '—';
    return (value * 100).toFixed(1) + '%';
  };

  const getMetricColor = (value) => {
    if (value == null) return 'text-gray-400';
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ML Model Management</h1>
          <p className="text-gray-500 mt-1">Train, monitor, and manage dropout prediction models</p>
        </div>
        {/* ML Service Status */}
        <div className="flex items-center gap-3">
          {mlHealth && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              mlHealth.healthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mlHealth.healthy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              ML Service: {mlHealth.mlServiceStatus}
            </span>
          )}
          <button onClick={checkHealth} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Training Panel */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Train New Model
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="random_forest">Random Forest</option>
              <option value="gradient_boosting">Gradient Boosting</option>
              <option value="xgboost">XGBoost</option>
            </select>
          </div>
          <button
            onClick={handleTrain}
            disabled={training || !mlHealth?.healthy}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {training ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Train Model
              </>
            )}
          </button>
        </div>
        {!mlHealth?.healthy && (
          <p className="mt-2 text-sm text-red-600">ML service is not available. Start the service before training.</p>
        )}
      </div>

      {/* Model Versions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Model Versions
          <span className="text-sm font-normal text-gray-500">({models.length} total)</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : models.length === 0 ? (
          <div className="card text-center py-12">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No models trained yet</h3>
            <p className="text-gray-500 mt-1">Train your first model to start generating dropout predictions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {models.map((model, i) => {
              const expanded = expandedId === model.id;
              const metrics = model.metrics || {};

              return (
                <motion.div
                  key={model.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : model.id)}
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {modelTypeLabels[model.modelType] || model.modelType}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          v{model.version}
                        </span>
                        {i === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {model.trainedAt ? new Date(model.trainedAt).toLocaleString('en-IN') : 'Unknown'}
                      </p>
                    </div>

                    {/* Metrics Summary */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">F1 Score</p>
                        <p className={`text-lg font-bold ${getMetricColor(metrics.f1_score)}`}>
                          {formatMetric(metrics.f1_score)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">AUC-ROC</p>
                        <p className={`text-lg font-bold ${getMetricColor(metrics.auc_roc)}`}>
                          {formatMetric(metrics.auc_roc)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Accuracy</p>
                        <p className={`text-lg font-bold ${getMetricColor(metrics.accuracy)}`}>
                          {formatMetric(metrics.accuracy)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      {/* Full Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: 'Accuracy', value: metrics.accuracy },
                          { label: 'Precision', value: metrics.precision },
                          { label: 'Recall', value: metrics.recall },
                          { label: 'F1 Score', value: metrics.f1_score },
                          { label: 'AUC-ROC', value: metrics.auc_roc },
                          { label: 'Total Samples', value: metrics.total_samples, raw: true },
                          { label: 'At-Risk', value: metrics.positive_samples, raw: true },
                          { label: 'Low-Risk', value: metrics.negative_samples, raw: true },
                        ].map(({ label, value, raw }) => (
                          <div key={label} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className={`text-lg font-bold ${raw ? 'text-gray-900' : getMetricColor(value)}`}>
                              {raw ? (value ?? '—') : formatMetric(value)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Confusion Matrix */}
                      {metrics.confusion_matrix && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Confusion Matrix</h4>
                          <div className="grid grid-cols-2 gap-1 max-w-xs">
                            <div className="bg-green-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">True Negative</p>
                              <p className="font-bold text-green-700">{metrics.confusion_matrix.true_negative}</p>
                            </div>
                            <div className="bg-red-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">False Positive</p>
                              <p className="font-bold text-red-700">{metrics.confusion_matrix.false_positive}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">False Negative</p>
                              <p className="font-bold text-orange-700">{metrics.confusion_matrix.false_negative}</p>
                            </div>
                            <div className="bg-green-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">True Positive</p>
                              <p className="font-bold text-green-700">{metrics.confusion_matrix.true_positive}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feature Importances */}
                      {model.featureImportances && Object.keys(model.featureImportances).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" /> Feature Importances
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(model.featureImportances)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 10)
                              .map(([feature, value]) => (
                                <div key={feature} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-40 truncate">{feature.replace(/_/g, ' ')}</span>
                                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-indigo-500 h-1.5 rounded-full"
                                      style={{ width: `${Math.min(value * 100 * 5, 100)}%` }} />
                                  </div>
                                  <span className="text-xs font-mono text-gray-600 w-12 text-right">
                                    {(value * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="mt-4 text-xs text-gray-500">
                        <p>File: {model.fileKey}</p>
                        {model.trainingSamples && <p>Training Samples: {model.trainingSamples}</p>}
                        {model.featureCount && <p>Features: {model.featureCount}</p>}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
