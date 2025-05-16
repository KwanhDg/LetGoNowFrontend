import { supabase } from '../../../../../lib/supabase';
import { notFound } from 'next/navigation';
import YachtForm from '../../components/YachtForm';
import { Metadata } from 'next';

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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Chỉnh sửa du thuyền',
  }
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