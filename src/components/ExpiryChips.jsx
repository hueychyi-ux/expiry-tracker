import { addToToday, getTodayDate, formatDate, daysUntilExpiry, formatDaysRemaining } from '../utils/dateUtils';

export const EXPIRY_CHIPS = [
  { key: '1w', label: '1 week', amount: { days: 7 } },
  { key: '1m', label: '1 month', amount: { months: 1 } },
  { key: '3m', label: '3 months', amount: { months: 3 } },
  { key: '6m', label: '6 months', amount: { months: 6 } },
  { key: '1y', label: '1 year', amount: { months: 12 } },
  { key: 'pick', label: 'Pick date' }
];

// Expiry picker: tap a chip to set the date, tap it again to clear it.
// value: "YYYY-MM-DD" or ''   selected: chip key or null
// onChange(date, chipKey)
function ExpiryChips({ value, selected, onChange }) {
  const handleTap = (chip) => {
    if (selected === chip.key) {
      onChange('', null);
      return;
    }
    if (chip.key === 'pick') {
      onChange(value || getTodayDate(), 'pick');
      return;
    }
    onChange(addToToday(chip.amount), chip.key);
  };

  const days = daysUntilExpiry(value);

  return (
    <div>
      <div className="chip-row">
        {EXPIRY_CHIPS.map(chip => (
          <button
            key={chip.key}
            type="button"
            className={`chip ${selected === chip.key ? 'chip-selected' : ''}`}
            onClick={() => handleTap(chip)}
            aria-pressed={selected === chip.key}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {selected === 'pick' && (
        <input
          type="date"
          className="form-input"
          value={value}
          onChange={e => onChange(e.target.value, 'pick')}
          style={{ marginTop: '12px' }}
        />
      )}

      <div className="chip-result">
        {value
          ? <>Expires on <strong>{formatDate(value)}</strong> · {formatDaysRemaining(days).replace('Expires ', '')}</>
          : 'No expiry date'}
      </div>
    </div>
  );
}

export default ExpiryChips;
