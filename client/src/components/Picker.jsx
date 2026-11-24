import { useEffect, useId, useRef, useState } from 'react'
import Popover from './Popover.jsx'

function PickerList({ label, options, value, multiple, onPick }) {
  const listId = useId()
  const listRef = useRef(null)
  const selectedIndex = options.findIndex(option => (multiple ? value.includes(option.value) : option.value === value))
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0))

  useEffect(() => {
    listRef.current.focus()
  }, [])

  const isSelected = option => (multiple ? value.includes(option.value) : option.value === value)

  function moveWithKeys(event) {
    const moves = { ArrowDown: activeIndex + 1, ArrowUp: activeIndex - 1, Home: 0, End: options.length - 1 }
    if (event.key in moves) {
      event.preventDefault()
      setActiveIndex(Math.min(Math.max(moves[event.key], 0), options.length - 1))
    } else if ((event.key === 'Enter' || event.key === ' ') && options[activeIndex]) {
      event.preventDefault()
      onPick(options[activeIndex].value)
    }
  }

  if (!options.length) return <p className="picker-empty">Nothing to choose yet.</p>

  return (
    <ul
      ref={listRef}
      className="picker"
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={`${listId}-${activeIndex}`}
      onKeyDown={moveWithKeys}
    >
      {options.map((option, index) => (
        <li
          key={option.value}
          id={`${listId}-${index}`}
          role="option"
          aria-selected={isSelected(option)}
          className={index === activeIndex ? 'is-active' : undefined}
          onPointerMove={() => setActiveIndex(index)}
          onClick={() => onPick(option.value)}
        >
          {option.icon}
          <span className="picker-label">{option.label}</span>
          {isSelected(option) && <span className="picker-check" aria-hidden="true">✓</span>}
        </li>
      ))}
    </ul>
  )
}

export default function Picker({ label, options, value, onChange, multiple = false, buttonContent, buttonClassName }) {
  return (
    <Popover label={label} buttonContent={buttonContent} buttonClassName={buttonClassName}>
      {close => (
        <PickerList
          label={label}
          options={options}
          value={value}
          multiple={multiple}
          onPick={picked => {
            if (multiple) {
              onChange(value.includes(picked) ? value.filter(item => item !== picked) : [...value, picked])
            } else {
              onChange(picked)
              close()
            }
          }}
        />
      )}
    </Popover>
  )
}
