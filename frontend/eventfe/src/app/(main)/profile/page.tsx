"use client"

import { useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { ProfileForm } from "./ProfileForm"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/services/auth.service"
import { ImageUpload } from "@/components/ui-custom/ImageUpload"

export default function ProfilePage() {
  const [pendingAvatarKey, setPendingAvatarKey] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
  })

  const user = data?.data?.user

  return (
    <Card className="w-full px-[30px] mt-[20px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-[10px]">
            <ImageUpload
              folder="avatars"
              variant="avatar"
              currentImageUrl={user?.avatarUrl ?? "/hinh-nen-may-tinh-anime.jpg"}
              onUpload={setPendingAvatarKey}
            />
            <div>
              <h2>{isLoading ? "..." : (user?.userName ?? "\u2014")}</h2>
              <div>{isLoading ? "..." : (user?.email ?? "\u2014")}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <ProfileForm user={user} isLoading={isLoading} pendingAvatarKey={pendingAvatarKey} />
    </Card>
  )
}
