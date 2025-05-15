import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronDown,
  User2,
  ChevronUp,
  ChartColumn,
  Ticket,
  Plus,
  LogOut,
  ListMinusIcon,
  Contact2Icon,
  HistoryIcon,
  Webhook,
  Activity,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Panel",
    url: "",
    icon: ChartColumn,
    menuaction: false,
  },
  {
    title: "Contactos",
    url: "contactos",
    icon: Contact2Icon,
    menuaction: true,
    actionUrl: "crear",
  },

  {
    title: "Campañas Activas",
    url: `workflows`,
    icon: ListMinusIcon,
    menuaction: false,
  },
  {
    title: "Historial de Campañas",
    url: "historial",
    icon: HistoryIcon,
    menuaction: true,
    actionUrl: "crear",
  },
  {
    title: "Webhooks",
    url: "webhooks",
    icon: Webhook,
    menuaction: true,
  },

  {
    title: "Configuración",
    url: "configuracion",
    icon: Settings,
    menuaction: true,
    actionUrl: "crear",
  },
];

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import WorkspaceDropdown from "./WorkspaceDropdown";
import { Label } from "./ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

export function AppSidebar() {
  const router = useRouter();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="space-y-2">
              <Label>Workspaces</Label>
              <WorkspaceDropdown />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <div className="flex h-full flex-col items-start justify-between pb-4">
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            "/dashboard/" + encodeURIComponent(item.url),
                          )
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="flex w-full cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListMinusIcon />
                      <span>Campañas</span>
                    </div>
                    <ChevronDown />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuButton asChild>
                        <a className="cursor-pointer">
                          <Activity />
                          <span> Activas</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuButton asChild>
                        <a className="cursor-pointer">
                          <HistoryIcon />
                          <span> Historial</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>

          <div className="w-full px-2">
            <div className="flex w-full cursor-pointer items-center gap-2 px-2 py-2">
              <Settings />
              <p> Configuraciones</p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
