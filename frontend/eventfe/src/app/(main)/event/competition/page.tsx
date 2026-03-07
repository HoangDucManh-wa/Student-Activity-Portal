import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PersonalForm } from "./PersonalForm"
import { GroupForm } from "./GroupForm"

export default function CompetitionPage() {
  return (
    <Tabs defaultValue="personal" className="w-full my-[30px] flex flex-col items-center">
      <TabsList>
        <TabsTrigger value="personal">Cá nhân</TabsTrigger>
        <TabsTrigger value="group">Nhóm</TabsTrigger>
      </TabsList>
      <TabsContent value="personal" className="w-[600px]">
        <PersonalForm />
      </TabsContent>
      <TabsContent value="group" className="w-[600px]">
        <GroupForm />
      </TabsContent>
    </Tabs>
  )
}
