const fs = require('fs');
const PDFDocument = require('pdfkit')

const companyAddress_y = 30
const companyAddress_height = 35
const company_tel_y = companyAddress_y + companyAddress_height
const taxpayer_y = company_tel_y + 15
const header_width = 180
const header_top_left_x = 395
const shipping_top_left_x = 20
const shipping_top_left_y = taxpayer_y + 15
const shipping_header_height = 92
const lineShippingWidth = 0.5
const wh_text_label_width = 60
const contact_text_height = 10
const title_space = 2
const shipping_order_top_left_y = taxpayer_y + shipping_header_height + 18
const column_1_width = 30
const column_2_width = 50
const column_3_width = 160
const column_4_width = 50
const column_5_width = 50
const column_6_width = 50
const column_7_width = 50
const column_8_width = 50
const column_9_width = 65
let shipping_order_table_height = 450
const shipping_order_table_width = 555
const default_font_size = 7
const num_order = 28
const max_num_order = 40


async function generateShippingOrderFilePDF(data, pathFile) {

    return new Promise(function (resolve, reject) {

        let file = fs.createWriteStream(pathFile)

        let doc = new PDFDocument({
            autoFirstPage: false,
            bufferPages: true
        })

        try {
            doc.pipe(file);

            const responseShippingOrderItems = data.items


            let new_responseShippingOrderItems = []

            responseShippingOrderItems.forEach(element => {
                new_responseShippingOrderItems.push(element)

                element.shippingDetails.forEach(item => {
                    new_responseShippingOrderItems.push(item)
                })

            });

            let i, j, temparray
            const chunk = max_num_order;
            let items_split = []
            for (i = 0, j = new_responseShippingOrderItems.length; i < j; i += chunk) {
                temparray = new_responseShippingOrderItems.slice(i, i + chunk);
                items_split.push(temparray)
            }


            // calculate page
            let pages = 1
            if (new_responseShippingOrderItems.length > num_order) {
                const new_items = new_responseShippingOrderItems.length - num_order
                pages = Math.ceil(new_items / max_num_order) + 1
            }

            // add page
            for (let i = 0; i < pages; i++) {
                doc.addPage({
                    size: [595, 841],
                    margins: {
                        top: 30,
                        bottom: 20,
                        left: 20,
                        right: 30
                    }
                })
            }

            // draw pdf
            doc.font('./resources/fonts/Prompt-Regular.ttf')
            doc.fontSize(default_font_size);
            const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
            for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                doc.switchToPage(i);
                generateHeader(doc, {})
                generateShippingContact(doc, data)
                generateShippingOrderTable(doc, items_split[i] || [])
                if (i === end - 1) {
                    generateResult(doc, data)
                }

            }

            doc.end()
            resolve({
                fileStatus: true,
                file: file
            })
        } catch (err) {
            reject(err)
        }
    });


}


function generateHeader(doc, data) {

    // draw header line
    const header_top_left_y = 30
    const header_height = 50
    const lineWidth = 0.8
    doc.lineWidth(lineWidth)
    doc.lineJoin('round')
        .rect(header_top_left_x,
            header_top_left_y,
            header_width,
            header_height)
        .stroke();


    doc.image('resources/images/default_grCode.png', header_top_left_x - 60, header_top_left_y - 3, {
        fit: [header_height + 5, header_height + 5],
    });

    //draw header
    const header_th = 'ใบส่งของ'
    const header_en = 'Shipping Order'
    doc.fontSize(9)
    doc.text(`${header_th}`, header_top_left_x, (header_top_left_y + 9), {
        align: 'center',
        width: header_width
    })
    doc.text(`${header_en}`, header_top_left_x, (header_top_left_y + 23), {
        align: 'center',
        width: header_width
    })
}



function generateShippingContact(doc, data) {
    // draw line shipping contact
    const picking_header_width = 373
    doc.lineWidth(lineShippingWidth)
    doc.lineJoin('round')
        .rect(shipping_top_left_x,
            shipping_top_left_y,
            picking_header_width,
            shipping_header_height)
        .stroke();

    // draw header detail label
    const from_wh_label = 'From W/H :'
    const from_wh_label_x = shipping_top_left_x + 7
    const from_wh_label_y = shipping_top_left_y + 2
    const contact_label_text_options = {
        align: 'left',
        width: wh_text_label_width
    }
    doc.fontSize(default_font_size);
    doc.text(`${from_wh_label}`, from_wh_label_x, from_wh_label_y, contact_label_text_options)

    const wh_text_value_width = picking_header_width - 70
    // draw contact value
    const from_wh_value = data.fromWarehouseNameTH || data.fromWarehouseNameEN || ''
    const to_wh_value = data.toWarehouseNameTH || data.toWarehouseNameEN || ''


    const from_wh_value_x = wh_text_label_width + 10
    doc.text(`${from_wh_value}`, from_wh_value_x, from_wh_label_y, {
        align: 'left',
        width: wh_text_value_width
    })

    const to_wh_label = 'To W/H :'
    const to_wh_label_x = from_wh_label_x + 185
    doc.text(`${to_wh_label}`, to_wh_label_x, from_wh_label_y, {
        align: 'left',
        width: wh_text_value_width
    })


    const to_wh_value_x = to_wh_label_x + 50
    doc.text(`${to_wh_value}`, to_wh_value_x, from_wh_label_y, {
        align: 'left',
        width: wh_text_value_width
    })

    /*********************************************************/

    // draw line shipping date
    const request_date_top_left_x = header_top_left_x
    const request_date_top_left_y = taxpayer_y + 15
    const request_date_header_width = header_width
    const request_date_header_height = shipping_header_height

    doc.lineWidth(lineShippingWidth)

    doc.lineJoin('round')
        .rect(request_date_top_left_x,
            request_date_top_left_y,
            request_date_header_width,
            request_date_header_height)
        .stroke();


    // draw picking date label
    const label_request_date_th = 'วันที่ :'
    const label_request_date_th_x = request_date_top_left_x + 7
    const label_request_date_th_y = request_date_top_left_y + 2
    const contact_text_label_options = {
        align: 'left',
        width: wh_text_label_width
    }
    doc.fontSize(default_font_size);
    doc.text(`${label_request_date_th}`, label_request_date_th_x, label_request_date_th_y, contact_text_label_options)
    const label_request_date_en = 'Request Date'
    const label_request_date_en_y = label_request_date_th_y + contact_text_height
    doc.text(`${label_request_date_en}`, label_request_date_th_x, label_request_date_en_y, contact_text_label_options)

    const label_order_no_th = 'เลขที่ :'
    const label_order_no_th_y = label_request_date_en_y + contact_text_height + title_space
    doc.text(`${label_order_no_th}`, label_request_date_th_x, label_order_no_th_y, contact_text_label_options)
    const label_order_no_en = 'Order No.'
    const label_order_no_en_y = label_order_no_th_y + contact_text_height
    doc.text(`${label_order_no_en}`, label_request_date_th_x, label_order_no_en_y, contact_text_label_options)

    const label_refer_pr_no_th = 'เลขที่ใบขอซื้อ :'
    const label_refer_pr_no_th_y = label_order_no_en_y + contact_text_height + title_space
    doc.text(`${label_refer_pr_no_th}`, label_request_date_th_x, label_refer_pr_no_th_y, contact_text_label_options)
    const label_refer_pr_no_en = 'Picking Date'
    const label_refer_pr_no_en_y = label_refer_pr_no_th_y + contact_text_height
    doc.text(`${label_refer_pr_no_en}`, label_request_date_th_x, label_refer_pr_no_en_y, contact_text_label_options)

    const label_delivery_date_th = 'กำหนดส่งสินค้า :'
    const label_delivery_date_th_y = label_refer_pr_no_en_y + contact_text_height + title_space
    doc.text(`${label_delivery_date_th}`, label_request_date_th_x, label_delivery_date_th_y, contact_text_label_options)
    const label_delivery_date_th_en = 'Shipping Date'
    const label_delivery_date_en_y = label_delivery_date_th_y + contact_text_height
    doc.text(`${label_delivery_date_th_en}`, label_request_date_th_x, label_delivery_date_en_y, contact_text_label_options)

    // draw picking date value
    let date = ''
    if (data.transactionDate) {
        const d = new Date(data.transactionDate);
        date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
    }
    const value_request_date = date
    const value_order_no_th = data.trNumber || ''
    const value_picking_date = ''
    const value_shipping_date = ''


    const request_date_value_width = 100
    const value_request_date_x = label_request_date_th_x + 55
    const value_request_date_y = label_request_date_th_y
    const request_date_value_text_options = {
        align: 'left',
        width: request_date_value_width
    }
    doc.text(`${value_request_date}`, value_request_date_x, value_request_date_y, request_date_value_text_options)
    const value_order_no_th_y = label_request_date_en_y + contact_text_height + title_space
    doc.text(`${value_order_no_th}`, value_request_date_x, value_order_no_th_y, request_date_value_text_options)


    const value_picking_date_y = label_order_no_en_y + contact_text_height + title_space
    doc.text(`${value_picking_date}`, value_request_date_x, value_picking_date_y, request_date_value_text_options)


    const value_shipping_date_y = label_refer_pr_no_en_y + contact_text_height + title_space
    doc.text(`${value_shipping_date}`, value_request_date_x, value_shipping_date_y, request_date_value_text_options)


}



function generateShippingOrderTable(doc, data) {

    shipping_order_table_height = 450

    doc.lineWidth(lineShippingWidth)
    const table_header_height = 25
    // table header
    doc.lineJoin('round')
        .rect(shipping_top_left_x,
            shipping_order_top_left_y,
            shipping_order_table_width,
            table_header_height)
        .stroke();


    // title column 1
    const column_1_x = shipping_top_left_x + column_1_width
    const title_column_1_th = 'ลำดับ'
    const title_column_1_en = 'No.'
    const title_column_1_y = shipping_order_top_left_y + 2
    doc.fontSize(default_font_size);
    doc.text(`${title_column_1_th}`, shipping_top_left_x, title_column_1_y, {
        align: 'center',
        width: column_1_width
    }).text(`${title_column_1_en}`, {
        align: 'center',
        width: column_1_width
    })


    const column_2_x = column_1_x + column_2_width
    const title_column_2_th = 'รหัสสินค้า'
    const title_column_2_en = 'Item Code'
    doc.text(`${title_column_2_th}`, column_1_x, title_column_1_y, {
        align: 'center',
        width: column_2_width
    }).text(`${title_column_2_en}`, {
        align: 'center',
        width: column_2_width
    })


    const column_3_x = column_2_x + column_3_width
    const title_column_3_th = 'รายละเอียด'
    const title_column_3_en = 'Item Description'
    doc.text(`${title_column_3_th}`, column_2_x, title_column_1_y, {
        align: 'center',
        width: column_3_width
    }).text(`${title_column_3_en}`, {
        align: 'center',
        width: column_3_width
    })


    const column_4_x = column_3_x + column_4_width
    const title_column_4_th = 'หน่วย'
    const title_column_4_en = 'Unit'
    doc.text(`${title_column_4_th}`, column_3_x, title_column_1_y, {
        align: 'center',
        width: column_4_width
    }).text(`${title_column_4_en}`, {
        align: 'center',
        width: column_4_width
    })


    const column_5_x = column_4_x + column_5_width
    const title_column_5_th = 'จำนวน'
    const title_column_5_en = 'Shiping'
    doc.text(`${title_column_5_th}`, column_4_x, title_column_1_y, {
        align: 'center',
        width: column_5_width
    }).text(`${title_column_5_en}`, {
        align: 'center',
        width: column_5_width
    })

    const column_6_x = column_5_x + column_6_width
    const title_column_6_th = 'วันหมดอายุ'
    const title_column_6_en = '-'
    doc.text(`${title_column_6_th}`, column_5_x, title_column_1_y, {
        align: 'center',
        width: column_6_width
    }).text(`${title_column_6_en}`, {
        align: 'center',
        width: column_6_width
    })

    const column_7_x = column_6_x + column_7_width
    const title_column_7_th = 'จำนวน'
    const title_column_7_en = 'Receive'
    doc.text(`${title_column_7_th}`, column_6_x, title_column_1_y, {
        align: 'center',
        width: column_7_width
    }).text(`${title_column_7_en}`, {
        align: 'center',
        width: column_7_width
    })

    const column_8_x = column_7_x + column_8_width
    const title_column_8_th = 'วันหมดอายุ'
    const title_column_8_en = '-'
    doc.text(`${title_column_8_th}`, column_7_x, title_column_1_y, {
        align: 'center',
        width: column_8_width
    }).text(`${title_column_8_en}`, {
        align: 'center',
        width: column_8_width
    })

    const title_column_9_th = '-'
    const title_column_9_en = 'Bin Location'
    doc.text(`${title_column_9_th}`, column_8_x, title_column_1_y, {
        align: 'center',
        width: column_9_width
    }).text(`${title_column_9_en}`, {
        align: 'center',
        width: column_9_width
    })


    let order_y = shipping_order_top_left_y + table_header_height + 3

    for (let i = 0; i < data.length; i++) {

        let seq = data[i].seq || ''
        let productItemCode = ''
        let itemDescription = ''
        let shippingUnit = ''
        let shippingQuantity = ''
        let expireDate = ''

        if (seq !== '') {
            productItemCode = data[i].productItemCode || productItemCode
            itemDescription = data[i].productItemNameTH || data[i].productItemNameEN || itemDescription
            shippingUnit = data[i].unitNameTH || ata[i].unitNameEN || shippingUnit
            shippingQuantity = data[i].shippingQuantity >= 0 ? data[i].shippingQuantity : shippingQuantity
        } else {
            shippingQuantity = data[i].quantity >= 0 ? data[i].quantity : shippingQuantity
            if (data[i].expiredDate != null && data[i].expiredDate != '') {
                const dateTimeStamp = Date.parse(data[i].expiredDate);
                const d = new Date(dateTimeStamp);
                expireDate = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
            }else{
                expireDate = '-'
            }
            
        }

        doc.text(`${seq}`, shipping_top_left_x, order_y, {
            align: 'center',
            width: column_1_width
        })
        doc.text(`${productItemCode}`, column_1_x, order_y, {
            align: 'center',
            width: column_2_width
        })
        doc.text(`${itemDescription}`, column_2_x + 5, order_y, {
            align: 'left',
            width: column_3_width - 10
        })

        doc.text(`${shippingUnit}`, column_3_x + 5, order_y, {
            align: 'center',
            width: column_4_width - 10
        })

        if (seq !== '') {
            doc.font('./resources/fonts/Prompt-Bold.ttf')
        }
        doc.text(`${shippingQuantity}`, column_4_x + 5, order_y, {
            align: 'center',
            width: column_5_width - 10
        })
        doc.font('./resources/fonts/Prompt-Regular.ttf')

        doc.text(`${expireDate}`, column_5_x + 5, order_y, {
            align: 'center',
            width: column_6_width - 10
        })

        const line_position_y = order_y + 11

        doc.moveTo(column_6_x + 5, line_position_y)
            .lineTo((column_6_x + 5) + (column_7_width - 10), line_position_y)
            .stroke()

        doc.moveTo(column_7_x + 5, line_position_y)
            .lineTo((column_7_x + 5) + (column_8_width - 10), line_position_y)
            .stroke()

        doc.moveTo(column_8_x + 5, line_position_y)
            .lineTo((column_8_x + 5) + (column_9_width - 10), line_position_y)
            .stroke()



        order_y += 15

        if (i > num_order - 1) {
            shipping_order_table_height += 15
        }
    }

    //  draw table
    doc.lineJoin('round')
        .rect(shipping_top_left_x,
            shipping_order_top_left_y,
            shipping_order_table_width,
            shipping_order_table_height)
        .stroke();

    // column 1
    const column_height = shipping_order_top_left_y + shipping_order_table_height
    doc.moveTo(column_1_x, shipping_order_top_left_y)
        .lineTo(column_1_x, column_height)
        .stroke()

    // column 2
    doc.moveTo(column_2_x, shipping_order_top_left_y)
        .lineTo(column_2_x, column_height)
        .stroke()

    // column 3
    doc.moveTo(column_3_x, shipping_order_top_left_y)
        .lineTo(column_3_x, column_height)
        .stroke()

    // column 4
    doc.moveTo(column_4_x, shipping_order_top_left_y)
        .lineTo(column_4_x, column_height)
        .stroke()

    // column 5
    doc.moveTo(column_5_x, shipping_order_top_left_y)
        .lineTo(column_5_x, column_height)
        .stroke()

    // column 6
    doc.moveTo(column_6_x, shipping_order_top_left_y)
        .lineTo(column_6_x, column_height)
        .stroke()

    // column 7
    doc.moveTo(column_7_x, shipping_order_top_left_y)
        .lineTo(column_7_x, column_height)
        .stroke()

    // column 8
    doc.moveTo(column_8_x, shipping_order_top_left_y)
        .lineTo(column_8_x, column_height)
        .stroke()


}

function generateResult(doc, data) {

    const shipping_order_table_amount_y = shipping_order_top_left_y + shipping_order_table_height
    const shipping_order_table_amount_height = 80

    doc.lineJoin('round')
        .rect(shipping_top_left_x,
            shipping_order_table_amount_y,
            shipping_order_table_width,
            shipping_order_table_amount_height)
        .stroke();
    doc.lineWidth(lineShippingWidth)

    const note = 'หมายเหตุ : '
    doc.text(`${note}`, shipping_top_left_x + 5, shipping_order_table_amount_y + 5, {
        align: 'left',
        width: shipping_order_table_width - column_5_width - column_6_width - column_7_width - 10
    })


    const signature_array = [
        {
            title: 'ผู้ส่ง / Shipping By'
        },
        {
            title: 'ผู้ตรวจสอบ / Checked By'
        },
        {
            title: 'ผู้บันทึกรับสินค้า / Recorded by'
        }
    ]
    const signature_y = shipping_order_table_amount_y + shipping_order_table_amount_height + 5
    const signature_width = 138
    const signature_height = 90
    const signature_space = 0.75
    const sigature_fill = '..................................................................................................'
    const sigature_fill_date = 'วันที่ / Date......................................................................'
    let signature_x = shipping_top_left_x

    signature_array.forEach(item => {

        doc.lineJoin('round')
            .rect(signature_x,
                signature_y,
                signature_width,
                signature_height)
            .stroke();
        const signature_label = item.title || ''
        const signature_label_x = signature_x + 5
        const signature_label_y = signature_y + 5
        const signature_label_text_options = {
            align: 'left',
            width: signature_width - 10
        }
        const sigature_fill_y = signature_y + signature_height - 30
        const sigature_fill_date_y = signature_y + signature_height - 15
        doc.text(`${signature_label}`, signature_label_x, signature_label_y, signature_label_text_options)
        doc.text(`${sigature_fill}`, signature_label_x, sigature_fill_y, signature_label_text_options)
        doc.text(`${sigature_fill_date}`, signature_label_x, sigature_fill_date_y, signature_label_text_options)

        signature_x += (signature_width + signature_space)
    })


}

module.exports = {
    generateShippingOrderFilePDF
}