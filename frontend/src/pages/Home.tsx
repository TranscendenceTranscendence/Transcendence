import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

          </div>
        </header>
        <div className="grid grid-flow-col grid-rows-3 gap-8 m-16 ">
          <div className="col-span-2 w-full ...">
            <Button className="p-16 font-bold text-5xl rounded-xl w-full">P L A Y</Button>
          </div>
          <div className="col-span-2 row-span-2 w-full rounded-xl bg-gray-200 ...">
            <p className="font-bold text-3xl m-8">FRIENDS</p>
          </div>
          <div className="row-span-3 w-full rounded-xl bg-gray-200 ...">
            <p className="font-bold text-3xl m-8">ACHIEVEMENTS</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
