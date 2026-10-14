import Header from './Header';
import Footer from './Footer';
export default function Page({ title, children }) {
  return <><Header/><main className="shell min-h-[65vh] py-12"><h1 className="display mb-8">{title}</h1>{children}</main><Footer/></>;
}
export function Notice({ error, children }) { return <p role={error ? 'alert' : 'status'} className={`my-4 border-l-4 p-4 ${error ? 'border-red-600 bg-red-50' : 'border-coral bg-white'}`}>{children}</p>; }
