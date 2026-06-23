import { Dropdown, Button, Label } from '@heroui/react'
import { useTheme } from '../lib/theme'
import type { ThemePref } from '../lib/theme'

const THEMES = [
  { key: 'auto', icon: '◐', label: 'Auto' },
  { key: 'light', icon: '☀', label: 'Light' },
  { key: 'dark', icon: '☾', label: 'Dark' },
] as const

export function ThemeMenu() {
  const { pref, setTheme } = useTheme()
  const current = THEMES.find((t) => t.key === pref) ?? THEMES[0]

  return (
    <Dropdown>
      <Button isIconOnly variant="outline" size="sm" aria-label={`Theme: ${current.label}`}>
        {current.icon}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu selectionMode="single" selectedKeys={[pref]} onAction={(key) => setTheme(key as ThemePref)}>
          {THEMES.map((t) => (
            <Dropdown.Item key={t.key} id={t.key} textValue={t.label}>
              <Dropdown.ItemIndicator />
              <Label>
                {t.icon}&nbsp;&nbsp;{t.label}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
