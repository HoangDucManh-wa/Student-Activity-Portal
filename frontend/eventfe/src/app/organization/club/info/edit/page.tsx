"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditClubPage() {
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  if (success) {
    return (
        <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-100 p-8 rounded-xl text-center w-[400px] shadow">

            <div className="flex justify-center mb-4">
            <div className="bg-[#08667a] text-white rounded-full w-10 h-10 flex items-center justify-center">
                ✓
            </div>
            </div>

            <div className="font-bold text-lg mb-2">
            Chỉnh sửa thành công
            </div>

            <div className="text-gray-600 mb-4">
            chỉnh sửa của bạn đã được ghi nhận vào hệ thống
            </div>

            <button
            onClick={() => router.push("/organization/club/info")}
            className="bg-[#08667a] text-white px-4 py-2 rounded"
            >
            Xem câu lạc bộ
            </button>
        </div>
        </div>
    )
  }
  return (
    <div className="p-10">
      <h1 className="text-center text-[#1A73E8] font-bold text-lg mb-6">
        CHỈNH SỬA THÔNG TIN CÂU LẠC BỘ
      </h1>

      {step === 1 && (
        <div className="space-y-6 max-w-[600px] mx-auto">
          {[
            "Ảnh đại diện",
            "Ảnh Logo",
            "Ảnh bên trái",
            "Ảnh bên phải",
          ].map((label, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-[150px]">{label}:</div>

              <div className="w-[200px] h-[120px] bg-gray-300 rounded flex items-center justify-center cursor-pointer">
                +
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-[#08667a] text-white px-4 py-2 rounded"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      )}
            {step === 2 && (
        <div className="max-w-[800px] mx-auto">

          <textarea
            placeholder="Giới thiệu câu lạc bộ..."
            className="w-full h-[300px] border rounded p-3 outline-none"
          />

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Trước
            </button>

            <button
            onClick={() => {
                // TODO: call API
                setSuccess(true)
            }}
            className="bg-[#08667a] text-white px-4 py-2 rounded"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}