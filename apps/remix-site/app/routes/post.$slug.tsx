import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { client } from '@tina-gen/client';
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { useTina, tinaField } from "tinacms/dist/react";


export const loader = async ({params}: LoaderFunctionArgs) => {
  // 有兩個抉擇點，一個是要用 remix 的 loader，還是要用 tina CMS 的 loader，
  try {
    const {slug} = params
    console.log(params);
    
    const post = await client.queries.post({ relativePath: `${slug}.md` });

    console.log(post.data);
    
    return json({ data: post.data, query: post.query, variables: post.variables });
  } catch (err) {
    console.log(err);
    throw new Error("GG")
  }

}


// 好...好像要 use client？
export default function Post() {
  const loaderData = useLoaderData<typeof loader>();

  const { data } = useTina({
    query: loaderData.query,
    variables: loaderData.variables,
    data: loaderData.data,
  });

  return (
    <div>
      <h1 data-tina-field={tinaField(data.post, 'title')}>{data.post.title}</h1>
      <div data-tina-field={tinaField(data.post, 'body')}>
        <TinaMarkdown content={data.post.body} />
      </div>
      {123123}
    </div>
  );
}