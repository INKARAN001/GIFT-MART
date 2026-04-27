import { useMemo } from 'react';
import {
  PROVINCES,
  getDistrictsForProvince,
  TOWNS_BY_DISTRICT,
  STREET_ROAD_HINTS,
} from '../data/sriLankaLocations';

/**
 * @param {{ street: string, city: string, district: string, state: string, zip: string, country: string }} shipping
 * @param {React.Dispatch<React.SetStateAction<typeof shipping>>} setShipping
 * @param {string} [idPrefix]
 * @param {{ street?: string, city?: string, district?: string, province?: string, zip?: string, country?: string }} [labels]
 * @param {boolean} [addressRequired] When false, HTML `required` is omitted (e.g. profile partial saves).
 */
export default function SriLankaAddressFields({ shipping, setShipping, idPrefix = 'sl', labels = {}, addressRequired = true }) {
  const districts = useMemo(() => getDistrictsForProvince(shipping.state), [shipping.state]);
  const towns = useMemo(() => {
    const d = shipping.district?.trim();
    if (!d) return [];
    return TOWNS_BY_DISTRICT[d] || [];
  }, [shipping.district]);

  const roadListId = `${idPrefix}-road-hints`;
  const cityListId = `${idPrefix}-city-hints`;

  const provinceOptions = useMemo(() => {
    const v = shipping.state?.trim();
    if (v && !PROVINCES.includes(v)) return [v, ...PROVINCES];
    return PROVINCES;
  }, [shipping.state]);

  const districtOptions = useMemo(() => {
    const v = shipping.district?.trim();
    const base = districts.length ? districts : [];
    if (v && !base.includes(v)) return [v, ...base];
    return base;
  }, [districts, shipping.district]);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label>{labels.province ?? 'Province *'}</label>
          <select
            className="form-control"
            required={addressRequired}
            value={shipping.state || ''}
            onChange={(e) => {
              const next = e.target.value;
              setShipping((s) => ({ ...s, state: next, district: '', city: '' }));
            }}
          >
            <option value="">Select province</option>
            {provinceOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{labels.district ?? 'District *'}</label>
          <select
            className="form-control"
            required={addressRequired}
            disabled={!shipping.state}
            value={shipping.district || ''}
            onChange={(e) => setShipping((s) => ({ ...s, district: e.target.value, city: '' }))}
          >
            <option value="">{shipping.state ? 'Select district' : 'Select province first'}</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label>{labels.city ?? 'City / town *'}</label>
          <input
            className="form-control"
            required={addressRequired}
            list={towns.length ? cityListId : undefined}
            autoComplete="address-level2"
            value={shipping.city}
            onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
            placeholder={labels.cityPlaceholder ?? 'Town or suburb'}
          />
          {towns.length > 0 ? (
            <datalist id={cityListId}>
              {towns.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          ) : null}
        </div>
        <div className="form-group">
          <label>{labels.zip ?? 'Postal code'}</label>
          <input
            className="form-control"
            value={shipping.zip}
            onChange={(e) => setShipping((s) => ({ ...s, zip: e.target.value }))}
            placeholder={labels.zipPlaceholder ?? 'e.g. 40000'}
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="form-group">
        <label>{labels.street ?? 'Street / address *'}</label>
        <input
          className="form-control"
          required={addressRequired}
          list={roadListId}
          autoComplete="street-address"
          value={shipping.street}
          onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
          placeholder={labels.streetPlaceholder ?? 'e.g. 42 Station Road, Nallur'}
        />
        <datalist id={roadListId}>
          {STREET_ROAD_HINTS.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </div>
      <div className="form-group">
        <label>{labels.country ?? 'Country'}</label>
        <input
          className="form-control"
          value={shipping.country}
          onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
          placeholder="Sri Lanka"
        />
      </div>
    </>
  );
}
