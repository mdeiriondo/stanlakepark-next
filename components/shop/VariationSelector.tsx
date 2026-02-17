'use client';

interface VariationSelectorProps {
  product: {
    attributes?: { name?: string; variation?: boolean | number }[];
  };
  variations: {
    id: number;
    price: string;
    stock_status?: string;
    attributes?: { id?: number; name?: string; option?: string }[];
  }[];
  selectedVariation: { id: number } | null;
  onSelect: (variation: (typeof variations)[0]) => void;
}

export default function VariationSelector({
  product,
  variations,
  selectedVariation,
  onSelect,
}: VariationSelectorProps) {
  // Atributo de variación: en WooCommerce puede venir variation: true, 1, o no estar; también podemos derivarlo de la primera variación
  const attributeFromProduct = product.attributes?.find(
    (attr) => attr.variation === true || attr.variation === 1
  );
  const attributeName =
    attributeFromProduct?.name ??
    variations[0]?.attributes?.[0]?.name ??
    'Option';

  if (variations.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-2">
        {attributeName}
      </label>

      <div className="grid grid-cols-1 gap-2">
        {variations.map((variation) => {
          const firstAttr = variation.attributes?.[0];
          const optionName =
            firstAttr?.option ?? String(variation.id);
          const isSelected = selectedVariation?.id === variation.id;
          // Solo deshabilitar si está explícitamente outofstock (algunas APIs omiten el campo o usan otro valor)
          const isOutOfStock = String(variation.stock_status ?? '').toLowerCase() === 'outofstock';

          return (
            <button
              key={variation.id}
              type="button"
              onClick={() => onSelect(variation)}
              disabled={isOutOfStock}
              className={`
                px-4 py-3 border rounded text-left transition-colors cursor-pointer
                ${isSelected ? 'text-white' : 'border-gray-200 text-dark hover:border-gray-300'}
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={
                isSelected
                  ? { borderColor: 'var(--color-brand)', backgroundColor: 'var(--color-brand)' }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!isSelected && !isOutOfStock)
                  e.currentTarget.style.borderColor = 'var(--color-brand)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = '';
              }}
            >
              <div className="flex justify-between items-center">
                <span className="capitalize">{String(optionName).replace(/-/g, ' ')}</span>
                <span>£{parseFloat(String(variation.price || '0')).toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
