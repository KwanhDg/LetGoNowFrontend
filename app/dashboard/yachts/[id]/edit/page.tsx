import { supabase } from '../../../../../lib/supabase';
import { notFound } from 'next/navigation';
import YachtForm from '../../components/YachtForm';

async function getYacht(id: string) {
  const { data, error } = await supabase
    .from('yachts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function EditYachtPage({ params }: Props) {
  const yacht = await getYacht(params.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Chỉnh sửa du thuyền</h1>
      <YachtForm yacht={yacht} />
    </div>
  );
} 