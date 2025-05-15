'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { useState } from 'react';

interface YachtFormProps {
  yacht?: {
    id: number;
    name: string;
    description: string;
    price: number;
    images?: { url: string }[];
  };
}

interface Room {
  name: string;
  area: number;
  max_guests: number;
  price: number;
  description: string;
  images: string[];
}

export default function YachtForm({ yacht }: YachtFormProps) {
  const router = useRouter();
  const isEditing = !!yacht;
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(yacht?.images?.map(img => img.url) || []);
  const [rooms, setRooms] = useState<Room[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `yachts/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('yachts')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('yachts')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImageUrls([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const yachtData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      images: imageUrls.map(url => ({ url }))
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('yachts')
          .update(yachtData)
          .eq('id', yacht.id);

        if (error) throw error;
      } else {
        const { data: newYacht, error } = await supabase
          .from('yachts')
          .insert(yachtData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            alert('Du thuyền này đã tồn tại');
          } else {
            throw error;
          }
        }

        if (newYacht && rooms.length > 0) {
          const roomsData = rooms.map(room => ({ ...room, yacht_id: newYacht.id }));
          const { error: roomError } = await supabase.from('rooms').insert(roomsData);
          if (roomError) {
            alert('Có lỗi khi lưu loại phòng');
            console.error(roomError);
          }
        }
      }

      router.push('/dashboard/yachts');
      router.refresh();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu du thuyền');
      console.error('Error saving yacht:', error);
    }
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { name: '', area: 0, max_guests: 1, price: 0, description: '', images: [] }]);
  };

  const handleRemoveRoom = (idx: number) => {
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const handleRoomChange = (idx: number, field: keyof Room, value: any) => {
    setRooms(rooms.map((room, i) => i === idx ? { ...room, [field]: value } : room));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Tên du thuyền
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={yacht?.name}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            defaultValue={yacht?.description}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Giá (VNĐ)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            defaultValue={yacht?.price}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                >
                  <span>Tải ảnh lên</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">hoặc kéo thả</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
            </div>
          </div>

          {/* Display uploaded images */}
          {imageUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Yacht image ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quản lý loại phòng */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Loại phòng</h2>
            <button type="button" onClick={handleAddRoom} className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600">+ Thêm loại phòng</button>
          </div>
          {rooms.length === 0 && <p className="text-gray-500">Chưa có loại phòng nào.</p>}
          {rooms.map((room, idx) => (
            <div key={idx} className="border rounded p-4 mb-4 relative bg-gray-50">
              <button type="button" onClick={() => handleRemoveRoom(idx)} className="absolute top-2 right-2 text-red-500">X</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Tên phòng</label>
                  <input type="text" value={room.name} onChange={e => handleRoomChange(idx, 'name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Diện tích (m²)</label>
                  <input type="number" value={room.area} onChange={e => handleRoomChange(idx, 'area', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số khách tối đa</label>
                  <input type="number" value={room.max_guests} onChange={e => handleRoomChange(idx, 'max_guests', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Giá phòng (VNĐ)</label>
                  <input type="number" value={room.price} onChange={e => handleRoomChange(idx, 'price', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea value={room.description} onChange={e => handleRoomChange(idx, 'description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" rows={2} required />
              </div>
              {/* Có thể bổ sung upload ảnh cho từng loại phòng sau */}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </form>
  );
} 