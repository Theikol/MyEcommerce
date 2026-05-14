const axios = require('axios');

const biteshipAxios = axios.create({
  baseURL: process.env.BITESHIP_BASE_URL || 'https://api.biteship.com',
  headers: {
    Authorization: process.env.BITESHIP_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Cari area / kelurahan untuk dapat areaId & postal code
 * Frontend akan pakai endpoint ini untuk autocomplete saat input alamat
 */
const searchArea = async (input) => {
  try {
    const { data } = await biteshipAxios.get('/v1/maps/areas', {
      params: {
        countries: 'ID',
        input,
        type: 'single',
      },
    });
    return data;
  } catch (error) {
    console.error('Biteship Search Area Error:', error.response?.data || error.message);
    throw new Error('Gagal mencari area Biteship');
  }
};

/**
 * Hitung ongkir berdasarkan origin → destination & berat
 * @param {Object} params - { destinationAreaId, items, couriers }
 * @returns {Array} pricing options
 */
const getShippingRates = async ({ destinationAreaId, items, couriers = 'jne,jnt,sicepat,anteraja' }) => {
  try {
    const payload = {
      origin_area_id: process.env.STORE_ORIGIN_AREA_ID,
      destination_area_id: destinationAreaId,
      couriers,
      items: items.map((it) => ({
        name: it.name,
        description: it.name,
        value: it.price,
        weight: it.weight, // gram
        quantity: it.quantity,
      })),
    };

    const { data } = await biteshipAxios.post('/v1/rates/couriers', payload);
    return data;
  } catch (error) {
    console.error('Biteship Rates Error:', error.response?.data || error.message);
    throw new Error('Gagal menghitung ongkir: ' + (error.response?.data?.error || error.message));
  }
};

/**
 * Buat order pengiriman di Biteship setelah pembayaran berhasil
 */
const createShippingOrder = async (order) => {
  try {
    const payload = {
      shipper_contact_name: 'Dchal Store',
      shipper_contact_phone: '081234567890',
      shipper_contact_email: 'dchalstore@example.com',
      shipper_organization: 'Dchal Store',
      origin_contact_name: 'Dchal Store',
      origin_contact_phone: '081234567890',
      origin_address: 'Cikarang, Bekasi',
      origin_postal_code: parseInt(process.env.STORE_ORIGIN_POSTAL_CODE) || 17530,
      origin_area_id: process.env.STORE_ORIGIN_AREA_ID,

      destination_contact_name: order.shippingAddress.recipientName,
      destination_contact_phone: order.shippingAddress.phone,
      destination_address: order.shippingAddress.fullAddress,
      destination_postal_code: parseInt(order.shippingAddress.postalCode),
      destination_area_id: order.shippingAddress.areaId,

      courier_company: order.shipping.courier,
      courier_type: order.shipping.courierService,
      delivery_type: 'now',
      order_note: `Order ${order.orderNumber}`,
      items: order.items.map((it) => ({
        name: it.name,
        description: it.name,
        category: 'electronics',
        value: it.price,
        quantity: it.quantity,
        weight: it.weight,
      })),
    };

    const { data } = await biteshipAxios.post('/v1/orders', payload);
    return data;
  } catch (error) {
    console.error('Biteship Create Order Error:', error.response?.data || error.message);
    throw new Error('Gagal membuat order pengiriman Biteship');
  }
};

/**
 * Cek tracking pengiriman
 */
const trackShipment = async (waybillId, courier) => {
  try {
    const { data } = await biteshipAxios.get(`/v1/trackings/${waybillId}/couriers/${courier}`);
    return data;
  } catch (error) {
    console.error('Biteship Tracking Error:', error.response?.data || error.message);
    throw new Error('Gagal melacak pengiriman');
  }
};

module.exports = { searchArea, getShippingRates, createShippingOrder, trackShipment };
