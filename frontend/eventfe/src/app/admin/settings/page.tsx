"use client"

import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Settings, ToggleLeft, ToggleRight, Trash2, Plus, GripVertical, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  getAllConfigs,
  updateConfig,
  getOverridesByKey,
  deleteOrgOverride,
  type SystemConfigItem,
} from "@/services/system-config.service"
import { http } from "@/configs/http.comfig"
import { envConfig } from "@/configs/env.config"

const CATEGORY_LABELS: Record<string, string> = {
  activity: "Hoat dong",
  registration: "Dang ky",
  organization: "To chuc",
  system: "He thong",
  homepage: "Trang chu",
  student: "Sinh vien",
}

interface OrgOption {
  organizationId: number
  organizationName: string
}

function ConfigToggle({
  config,
  onToggle,
  isPending,
}: {
  config: SystemConfigItem
  onToggle: (key: string, value: Record<string, unknown>) => void
  isPending: boolean
}) {
  const enabled = (config.value as { enabled?: boolean })?.enabled ?? false

  return (
    <div className="flex items-center justify-between py-4 px-4 border-b last:border-b-0">
      <div className="flex-1 mr-4">
        <p className="font-medium text-sm">{config.label}</p>
        {config.description && (
          <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
        )}
        <span className="text-xs text-gray-400 font-mono mt-1 block">{config.key}</span>
      </div>
      <button
        onClick={() => onToggle(config.key, { enabled: !enabled })}
        disabled={isPending}
        className="flex items-center gap-1 disabled:opacity-50"
        title={enabled ? "Tat" : "Bat"}
      >
        {enabled ? (
          <ToggleRight className="w-8 h-8 text-green-500" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-gray-400" />
        )}
      </button>
    </div>
  )
}

function ConfigNumber({
  config,
  onUpdate,
  isPending,
}: {
  config: SystemConfigItem
  onUpdate: (key: string, value: Record<string, unknown>) => void
  isPending: boolean
}) {
  const currentValue = (config.value as { value?: number })?.value ?? 0
  const [localValue, setLocalValue] = useState(String(currentValue))

  useEffect(() => {
    setLocalValue(String(currentValue))
  }, [currentValue])

  const handleBlur = () => {
    const num = Number(localValue)
    if (!isNaN(num) && num !== currentValue) {
      onUpdate(config.key, { value: num })
    }
  }

  return (
    <div className="flex items-center justify-between py-4 px-4 border-b last:border-b-0">
      <div className="flex-1 mr-4">
        <p className="font-medium text-sm">{config.label}</p>
        {config.description && (
          <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
        )}
        <span className="text-xs text-gray-400 font-mono mt-1 block">{config.key}</span>
      </div>
      <input
        type="number"
        min={0}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
        disabled={isPending}
        className="w-24 px-2 py-1 border rounded text-sm text-right disabled:opacity-50"
      />
    </div>
  )
}

function OrgOverridesSection({
  configKey,
  organizations,
  globalEnabled,
}: {
  configKey: string
  organizations: OrgOption[]
  globalEnabled: boolean
}) {
  const queryClient = useQueryClient()
  const [selectedOrgId, setSelectedOrgId] = useState<number | "">("")
  const [showAdd, setShowAdd] = useState(false)

  const { data: overridesResp } = useQuery({
    queryKey: ["config-overrides", configKey],
    queryFn: () => getOverridesByKey(configKey),
  })

  const overrides = overridesResp?.data ?? []

  const addMut = useMutation({
    mutationFn: ({ orgId, value }: { orgId: number; value: Record<string, unknown> }) =>
      updateConfig(configKey, value, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-overrides", configKey] })
      toast.success("Da them override cho to chuc")
      setShowAdd(false)
      setSelectedOrgId("")
    },
    onError: () => toast.error("Thao tac that bai"),
  })

  const toggleOverrideMut = useMutation({
    mutationFn: ({ orgId, enabled }: { orgId: number; enabled: boolean }) =>
      updateConfig(configKey, { enabled }, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-overrides", configKey] })
      toast.success("Da cap nhat")
    },
    onError: () => toast.error("Thao tac that bai"),
  })

  const deleteMut = useMutation({
    mutationFn: (orgId: number) => deleteOrgOverride(configKey, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-overrides", configKey] })
      toast.success("Da xoa override")
    },
    onError: () => toast.error("Thao tac that bai"),
  })

  const orgsWithOverride = overrides.map((o) => o.organizationId)
  const availableOrgs = organizations.filter(
    (org) => !orgsWithOverride.includes(org.organizationId),
  )

  return (
    <div className="mt-2 ml-4 mb-2">
      {overrides.length > 0 && (
        <div className="space-y-1">
          {overrides.map((ov) => {
            const enabled = (ov.value as { enabled?: boolean })?.enabled
            const isDifferent = enabled !== globalEnabled
            return (
              <div
                key={ov.configId}
                className="flex items-center gap-2 text-xs bg-gray-50 px-3 py-2 rounded"
              >
                <span className="font-medium">
                  {ov.organization?.organizationName ?? `Org #${ov.organizationId}`}
                </span>
                {isDifferent && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {enabled ? "BAT" : "TAT"}
                  </span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded ${isDifferent ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                  mac dinh: {globalEnabled ? "BAT" : "TAT"}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => ov.organizationId && toggleOverrideMut.mutate({ orgId: ov.organizationId, enabled: enabled === true ? false : true })}
                    disabled={toggleOverrideMut.isPending}
                    title={enabled ? "Tat override" : "Bat override"}
                    className={`p-1 rounded transition-colors ${enabled ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-green-50 text-gray-400 hover:text-green-600"}`}
                  >
                    {enabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => ov.organizationId && deleteMut.mutate(ov.organizationId)}
                    disabled={deleteMut.isPending}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                    title="Xoa override"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Them override cho to chuc
        </button>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : "")}
            className="text-xs border rounded px-2 py-1 flex-1"
          >
            <option value="">-- Chon to chuc --</option>
            {availableOrgs.map((org) => (
              <option key={org.organizationId} value={org.organizationId}>
                {org.organizationName}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedOrgId) {
                addMut.mutate({ orgId: selectedOrgId as number, value: { enabled: globalEnabled } })
              }
            }}
            disabled={!selectedOrgId || addMut.isPending}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Them (={globalEnabled ? "BAT" : "TAT"})
          </button>
          <button
            onClick={() => {
              setShowAdd(false)
              setSelectedOrgId("")
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Huy
          </button>
        </div>
      )}
    </div>
  )
}

interface BannerSlide {
  imageUrl: string
  linkUrl: string
  alt: string
}

function ConfigDomainList({
  config,
  onUpdate,
  isPending,
}: {
  config: SystemConfigItem
  onUpdate: (key: string, value: Record<string, unknown>) => void
  isPending: boolean
}) {
  const domains = (config.value as { domains?: string[] })?.domains ?? []
  const [localDomains, setLocalDomains] = useState(domains)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { setLocalDomains(domains); setDirty(false) }, [domains])

  const addDomain = () => {
    const d = window.prompt("Nhập đuôi email (VD: edu.vn)")
    if (d && !localDomains.includes(d.trim().toLowerCase())) {
      setLocalDomains((prev) => [...prev, d.trim().toLowerCase()])
      setDirty(true)
    }
  }

  const removeDomain = (d: string) => {
    setLocalDomains((prev) => prev.filter((x) => x !== d))
    setDirty(true)
  }

  const save = () => {
    onUpdate(config.key, { domains: localDomains })
    setDirty(false)
  }

  return (
    <div className="py-4 px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{config.label}</p>
          {config.description && (
            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
          )}
          <span className="text-xs text-gray-400 font-mono mt-1 block">{config.key}</span>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={isPending}
            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Lưu thay đổi
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {localDomains.map((d) => (
          <span
            key={d}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
          >
            @{d}
            <button
              onClick={() => removeDomain(d)}
              className="hover:text-red-600 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {localDomains.length === 0 && (
          <p className="text-xs text-gray-400">Chưa có đuôi email nào</p>
        )}
      </div>
      <button
        onClick={addDomain}
        className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm đuôi email
      </button>
    </div>
  )
}

function ConfigBannerSlides({
  config,
  onUpdate,
  isPending,
}: {
  config: SystemConfigItem
  onUpdate: (key: string, value: Record<string, unknown>) => void
  isPending: boolean
}) {
  const raw = (config.value as { slides?: BannerSlide[] })?.slides ?? []
  const [slides, setSlides] = useState<BannerSlide[]>(raw)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setSlides((config.value as { slides?: BannerSlide[] })?.slides ?? [])
    setDirty(false)
  }, [config.value])

  const update = (idx: number, field: keyof BannerSlide, val: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)))
    setDirty(true)
  }

  const addSlide = () => {
    setSlides((prev) => [...prev, { imageUrl: "", linkUrl: "", alt: `Banner ${prev.length + 1}` }])
    setDirty(true)
  }

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx))
    setDirty(true)
  }

  const save = () => {
    onUpdate(config.key, { slides })
    setDirty(false)
  }

  return (
    <div className="py-4 px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{config.label}</p>
          {config.description && (
            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
          )}
          <span className="text-xs text-gray-400 font-mono mt-1 block">{config.key}</span>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={isPending}
            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Luu thay doi
          </button>
        )}
      </div>

      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div key={idx} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <GripVertical className="w-4 h-4 text-gray-300 mt-2 shrink-0" />

              {/* Preview */}
              <div className="w-20 h-12 rounded overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.alt || "preview"}
                    width={80}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={() => {}}
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">URL anh *</label>
                  <input
                    type="text"
                    placeholder="https://... hoac /slide.png"
                    value={slide.imageUrl}
                    onChange={(e) => update(idx, "imageUrl", e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Link khi click (tuy chon)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={slide.linkUrl}
                      onChange={(e) => update(idx, "linkUrl", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Alt text</label>
                    <input
                      type="text"
                      placeholder="Mo ta anh"
                      value={slide.alt}
                      onChange={(e) => update(idx, "alt", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeSlide(idx)}
                className="text-red-400 hover:text-red-600 mt-1 shrink-0"
                title="Xoa slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSlide}
        className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
      >
        <Plus className="w-3.5 h-3.5" />
        Them slide moi
      </button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()

  const { data: configsResp, isLoading, isError } = useQuery({
    queryKey: ["system-configs"],
    queryFn: getAllConfigs,
  })

  const { data: orgsResp } = useQuery({
    queryKey: ["all-organizations-for-config"],
    queryFn: () =>
      http.get<{
        success: boolean
        data: { data: OrgOption[] }
      }>(`${envConfig.NEXT_PUBLIC_API_URL}/organizations?limit=100`),
  })

  const organizations: OrgOption[] = orgsResp?.data?.data ?? []
  const configs = configsResp?.data ?? []

  const updateMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, unknown> }) =>
      updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-configs"] })
      toast.success("Da cap nhat cau hinh")
    },
    onError: () => toast.error("Thao tac that bai"),
  })

  const handleUpdate = useCallback(
    (key: string, value: Record<string, unknown>) => {
      updateMut.mutate({ key, value })
    },
    // mutate is a stable reference in React Query v5
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateMut.mutate],
  )

  const categories = [...new Set(configs.map((c) => c.category))]

  const renderConfig = (config: SystemConfigItem) => {
    if (config.dataType === "boolean") {
      const enabled = (config.value as { enabled?: boolean })?.enabled ?? false
      return (
        <div key={config.configId}>
          <ConfigToggle
            config={config}
            onToggle={handleUpdate}
            isPending={updateMut.isPending}
          />
          <OrgOverridesSection configKey={config.key} organizations={organizations} globalEnabled={enabled} />
        </div>
      )
    }
    if (config.dataType === "number") {
      return (
        <div key={config.configId}>
          <ConfigNumber
            config={config}
            onUpdate={handleUpdate}
            isPending={updateMut.isPending}
          />
        </div>
      )
    }
    if (config.key === "student.allowed_email_domains") {
      return (
        <div key={config.configId} className="border-b last:border-b-0">
          <ConfigDomainList config={config} onUpdate={handleUpdate} isPending={updateMut.isPending} />
        </div>
      )
    }
    if (config.key === "homepage.banner_slides") {
      return (
        <div key={config.configId} className="border-b last:border-b-0">
          <ConfigBannerSlides
            config={config}
            onUpdate={handleUpdate}
            isPending={updateMut.isPending}
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        <h1 className="text-xl font-bold">Cau hinh he thong</h1>
      </div>

      {isError && (
        <div className="text-center py-16 text-red-500">
          Khong the tai cau hinh. Vui long thu lai sau.
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && configs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          Chua co cau hinh nao. Hay chay seed de tao cau hinh mac dinh.
        </div>
      )}

      {!isLoading && configs.length > 0 && (
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat] ?? cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="bg-white rounded-xl shadow-sm mt-4">
                {configs
                  .filter((c) => c.category === cat)
                  .map((config) => renderConfig(config))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
