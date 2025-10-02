import { createClient } from '../utils/supabase/server';

export default async function Page() {
  const supabase = createClient();

  const { data: todos } = await supabase.from<any, any>('todos').select();

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.text || JSON.stringify(todo)}</li>
      ))}
    </ul>
  );
}
