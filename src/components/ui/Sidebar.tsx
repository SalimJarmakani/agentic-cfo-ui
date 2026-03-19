import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import './Sidebar.css';

type SidebarContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function SidebarProvider({
  children,
  className,
  defaultOpen = true,
}: PropsWithChildren<{ className?: string; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState(defaultOpen);
  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar: () => setOpen((current) => !current),
    }),
    [open],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={joinClassNames('ui-sidebar-provider', className)} data-state={open ? 'expanded' : 'collapsed'}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

export function Sidebar({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <aside className={joinClassNames('ui-sidebar', className)} {...props}>
      {children}
    </aside>
  );
}

export function SidebarHeader({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={joinClassNames('ui-sidebar-header', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={joinClassNames('ui-sidebar-content', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroup({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={joinClassNames('ui-sidebar-group', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarInset({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={joinClassNames('ui-sidebar-inset', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarTrigger({
  className,
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      className={joinClassNames('ui-sidebar-trigger', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
