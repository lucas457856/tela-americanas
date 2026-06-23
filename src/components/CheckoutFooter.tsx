import siteBlindado from '../assets/siteblindado.svg';
import quality from '../assets/uality.svg';
import vtex from '../assets/vtex.svg';

export function CheckoutFooter() {
  return (
    <footer className="border-t border-[#d9d9d9] bg-[#f2f2f2] px-5 py-8 text-center text-xs font-semibold leading-5 text-[#666]">
      <p className="mx-auto max-w-[1100px]">
        todas as regras e promoções são válidas apenas para produtos vendidos e entregues pela americanas.com. o preço válido será o da finalização da compra. havendo divergência, prevalecerá o menor preço ofertado. americanas s.a / CNPJ: 00.776.574/0006-60 / Inscrição Estadual: 85.687.08-5 / Endereço Rua Sacadura Cabral, 102 - Rio de Janeiro, RJ - 20081-902
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
        <img className="h-[20px] object-contain" src={siteBlindado} alt="Site Blindado" />
        <img className="h-[20px] object-contain" src={quality} alt="Quality Digital" />
        <img className="h-[20px] object-contain" src={vtex} alt="VTEX" />
      </div>
    </footer>
  );
}
