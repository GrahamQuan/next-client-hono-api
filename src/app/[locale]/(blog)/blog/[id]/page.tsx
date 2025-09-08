export default async function Page(props: PageProps<'/[locale]/blog/[id]'>) {
  const { id, locale } = await props.params;

  return (
    <div>
      Blog -- {id} -- {locale}
    </div>
  );
}
