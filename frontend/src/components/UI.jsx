import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const LoadingSpinner = ({ label = 'Loading data...' }) => {
  const { theme } = useTheme();
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem',
      gap: '1rem'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={48} color="#4f46e5" />
      </motion.div>
      <span style={{ 
        fontWeight: '600', 
        color: theme === 'light' ? '#64748b' : '#94a3b8',
        fontSize: '1.1rem'
      }}>
        {label}
      </span>
    </div>
  );
};

export const EmptyState = ({ message = 'No records found for this selection' }) => {
  const { theme } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: `2px dashed ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
        color: theme === 'light' ? '#64748b' : '#94a3b8'
      }}
    >
      <Database size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
      <h3 style={{ margin: 0 }}>{message}</h3>
      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your filters or searching another city.</p>
    </motion.div>
  );
};

export const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div style={{ 
      background: '#fef2f2', 
      border: '1px solid #fee2e2', 
      borderRadius: '12px', 
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#ef4444'
    }}>
      <AlertCircle size={24} />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontWeight: '700' }}>System Error</h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>{message}</p>
      </div>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{
            background: 'white',
            border: '1px solid #fee2e2',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            color: '#ef4444'
          }}
        >
          <RefreshCw size={16} />
          Retry
        </motion.button>
      )}
    </div>
  );
};

export const GlassCard = ({ children, style = {}, padding = '1.5rem' }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(12px)',
      border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding,
      boxShadow: theme === 'light' ? '0 8px 32px 0 rgba(31, 38, 135, 0.07)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      color: theme === 'light' ? '#1e293b' : '#f8fafc',
      ...style
    }}>
      {children}
    </div>
  );
};

export const FilterBar = ({ 
  onCitySearch, 
  onThresholdChange, 
  thresholdLabel = "Min. Threshold",
  thresholdValue = 0,
  placeholder = "Search city (e.g. Delhi, Mumbai...)"
}) => {
  const { theme } = useTheme();
  const [city, setCity] = React.useState('');

  return (
    <GlassCard style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }} padding="1rem">
      <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
        <input 
          type="text" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCitySearch(city)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            borderRadius: '12px',
            border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
            background: theme === 'light' ? 'white' : '#0f172a',
            color: theme === 'light' ? '#1e293b' : 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            outline: 'none'
          }}
        />
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <Loader2 size={20} /> {/* Should be Search icon really, will use Loader for now as placeholder or import search */}
        </div>
        <button 
          onClick={() => onCitySearch(city)}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.8rem'
          }}
        >
          GO
        </button>
      </div>

      {onThresholdChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '250px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: theme === 'light' ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
            {thresholdLabel}: <span style={{ color: '#4f46e5' }}>{thresholdValue}%</span>
          </span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={thresholdValue}
            onChange={(e) => onThresholdChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
          />
        </div>
      )}
    </GlassCard>
  );
};
