"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Camera, Check, Loader2 } from "lucide-react";
import { studentData } from "../../data"; 

type EditType = "SINH_VIEN" | "CLB";

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [editType, setEditType] = useState<EditType>("SINH_VIEN");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    phone: "",
    clubName: "",
    password: "",
    university: "",
    avatar: "/hinh-nen-may-tinh-anime.jpg",
  });

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const searchId = id?.toString();

      const user = studentData.find(
        (u) => u.studentId === searchId || u.id.toString() === searchId
      );

      if (user) {
        if (user.role === "organization_leader") {
          setEditType("CLB");
          setFormData({
            ...formData,
            clubName: user.userName,
            email: user.email,
            university: user.university,
            avatar: user.avatar || "/hinh-nen-may-tinh-anime.jpg",
          });
        } else {
          setEditType("SINH_VIEN");
          setFormData({
            ...formData,
            fullName: user.userName,
            studentId: user.studentId || "",
            email: user.email,
            university: user.university,
            avatar: user.avatar || "/hinh-nen-may-tinh-anime.jpg",
          });
        }
      }
      setLoading(false);
    };

    if (id) loadData();
  }, [id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccess(false);
    router.push("/admin/management-account");
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center gap-2 text-[#005d7a]">
      <Loader2 className="animate-spin" /> Đang tải thông tin...
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-[#005d7a] mb-10 tracking-widest uppercase">
          CHỈNH SỬA {editType === "CLB" ? "TỔ CHỨC" : "SINH VIÊN"}: {id}
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); setShowSuccess(true); }} className="flex flex-col items-center gap-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm relative">
              <Image 
                src={formData.avatar} 
                alt="Avatar preview" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <p className="text-xs text-gray-400 mt-2 text-center italic">Nhấn vào ảnh để thay đổi</p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {editType === "SINH_VIEN" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Họ tên:</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className="border-b border-blue-300 outline-none p-1 focus:border-blue-600 transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Mã sinh viên:</label>
                  <input 
                    type="text" 
                    name="studentId"
                    value={formData.studentId} 
                    onChange={handleChange} 
                    className="border-b border-blue-300 outline-none p-1 focus:border-blue-600 transition-colors" 
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold">Tên tổ chức:</label>
                  <input 
                    type="text" 
                    name="clubName"
                    value={formData.clubName} 
                    onChange={handleChange} 
                    className="border-b border-blue-300 outline-none p-1 focus:border-blue-600 transition-colors w-full md:w-1/2" 
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="border-b border-blue-300 outline-none p-1 focus:border-blue-600 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Trường:</label>
              <input 
                type="text" 
                name="university" 
                value={formData.university} 
                onChange={handleChange} 
                className="border-b border-blue-300 outline-none p-1 focus:border-blue-600 transition-colors" 
              />
            </div>
          </div>

          <div className="w-full flex justify-end mt-12">
            <button
              type="submit"
              className="bg-[#005d7a] text-white px-8 py-2 rounded shadow hover:bg-[#004a61] transition-all active:scale-95 text-sm"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[#f8f9fa] border border-gray-300 p-8 rounded-sm shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex justify-center">
              <div className="bg-[#005d7a] rounded-full p-2">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-[#005d7a] text-lg font-bold mb-1">Chỉnh sửa thành công</h2>
            <p className="text-gray-600 text-sm mb-6">Thông tin đã được lưu vào hệ thống</p>
            
            <button
              onClick={handleSuccessRedirect}
              className="bg-[#005d7a] text-white px-6 py-1.5 rounded text-sm hover:bg-[#004a61]"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}