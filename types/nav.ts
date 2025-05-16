export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
}

export interface NavItemWithIcon extends NavItem {
  icon: string
  description: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[]
}
