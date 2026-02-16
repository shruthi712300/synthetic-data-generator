selected_node = "";
selected_node_key_value = {};

function drawTreeStructure(json, flow, int_id, int_type, thisdiv, select_all) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_id_key = sPageURL.split('&')[0];
    let global_app_id = app_id_key.split('=')[1];
    global_app_type = app_id_key.split('=')[1];
    if (typeof select_all === "undefined" || select_all === null) {
        select_all = "false";
    }
    let schema = json["data"];
    let buffer = "";
    let selected = [];
    let def_val = '{"type":"schema"}';
    let def_val1 = '{"type":"tables"}';
    let def_val2 = '{"type":"columns"}';
    if (select_all == "true") {
        def_val = '{"type":"schema", "selected" : true}';
        def_val1 = '{"type":"tables", "selected" : true}';
        def_val2 = '{"type":"columns", "selected" : true}';

    }

    let radio_text_list;
    let radio_id_list;
    let radio_html;

    if (global_app_type == "DA_SYNDA") {
        radio_text_list = ['SSN', 'Employer ID', 'Name', 'Full Name',
            'Name Based Gender', 'Named Based Title',
            'Name Mask', 'Age', 'Birth Date', 'Email',
            'Phone Number', 'Boolean Value', 'Date Format',
            'Expire Date', 'System Date', 'Flexible Date Range',
            'Company Name', 'Company Rating', 'Company URL',
            'Credit Card', 'Credit Card Name',
            'Address', 'US - State', 'US - State Abbrev',
            'US - State Zip Code', 'US - State Capital Area Code',
            'US - State Capital Country', 'US - State Capital',
            'Street Address', 'Street Type', 'Country List', 'Direction',
            'Calc', 'Database Unique ID', 'Mapping',
            'MatchString', 'Multi Weight', 'Percentage Accum',
            'Weight', 'Calendar Reference', 'Compare List', 'Compare String',
            'Compare Number', 'Currency Code', 'Random Money',
            'String Replacement', 'String Reverse', 'Substring', 'Null',
            'Number Base Convertor', 'Range',
            'SF Pick List', 'SF Query', 'Pad',
            'Random String', 'String Regex'];
        radio_id_list = ['SSN', 'Employer ID', 'Name', 'Full Name',
            'Name Based Gender', 'Named Based Title',
            'Name Mask', 'Age', 'Birth Date', 'Email',
            'Phone Number', 'Boolean Value', 'Date Format',
            'Expire Date', 'System Date', 'Flexible Date Range',
            'Company Name', 'Company Rating', 'Company URL',
            'Credit Card', 'Credit Card Name',
            'Address', 'US - State', 'US - State Abbrev',
            'US - State Zip Code', 'US - State Capital Area Code',
            'US - State Capital Country', 'US - State Capital',
            'Street Address', 'Street Type', 'Country List', 'Direction',
            'Calc', 'Database Unique ID', 'Mapping',
            'MatchString', 'Multi Weight', 'Percentage Accum',
            'Weight', 'Calendar Reference', 'Compare List', 'Compare String',
            'Compare Number', 'Currency Code', 'Random Money',
            'String Replacement', 'String Reverse', 'Substring', 'Null',
            'Number Base Convertor', 'Range',
            'SF Pick List', 'SF Query', 'Pad',
            'Random String', 'String Regex'];
        radio_html = '';
        for (let indx = 0; indx < radio_id_list.length; indx++) {
            radio_html += '<label class="mt-radio mt-radio-outline">' + radio_text_list[indx] +
                '<input type="radio" id="' + radio_id_list[indx] + '" value="1" name="test"/> \
                            <span></span></label>';
        }
        $('#jstree-nested-modal').find('.modal-title').text('Generators');
        $('#jstree-nested-modal').find('#radio_options').html(radio_html);
    }
    if (global_app_type == "DA_DAMSK") {
        radio_text_list = ["Suppress", "Generalize", "Generalize-categorical", "Identifier", "Sensitive", "SSN",
            "Name", "Address"];
        radio_id_list = ["Suppress", "Generalize", "Generalize-categorical", "Identifier", "Sensitive", "SSN",
            "Name", "Address"];
        radio_html = '';
        for (let indx = 0; indx < radio_id_list.length; indx++) {
            radio_html += '<label class="mt-radio mt-radio-outline">' + radio_text_list[indx] +
                '<input type="radio" id="' + radio_id_list[indx] + '" value="1" name="test"/> \
                            <span></span></label>';
        }
        $('#jstree-nested-modal').find('.modal-title').text('Maskers');
        $('#jstree-nested-modal').find('#radio_options').html(radio_html);
    }

    if (int_type == 'googletrends') {
        let geo_data = [{ 'text': 'Worldwide', 'id': 'Worldwide' }, {
            'text': 'Afghanistan',
            'id': 'AF'
        }, { 'text': 'Aland Islands', 'id': 'AX' }, { 'text': 'Albania', 'id': 'AL' }, {
            'text': 'Algeria',
            'id': 'DZ'
        }, { 'text': 'American Samoa', 'id': 'AS' }, { 'text': 'Andorra', 'id': 'AD' }, {
            'text': 'Angola',
            'id': 'AO'
        }, { 'text': 'Anguilla', 'id': 'AI' }, { 'text': 'Antarctica', 'id': 'AQ' }, {
            'text': 'Antigua \\u0026 Barbuda',
            'id': 'AG'
        }, { 'text': 'Argentina', 'id': 'AR' }, { 'text': 'Armenia', 'id': 'AM' }, {
            'text': 'Aruba',
            'id': 'AW'
        }, { 'text': 'Australia', 'id': 'AU' }, { 'text': 'Austria', 'id': 'AT' }, {
            'text': 'Azerbaijan',
            'id': 'AZ'
        }, { 'text': 'Bahamas', 'id': 'BS' }, { 'text': 'Bahrain', 'id': 'BH' }, {
            'text': 'Bangladesh',
            'id': 'BD'
        }, { 'text': 'Barbados', 'id': 'BB' }, { 'text': 'Belarus', 'id': 'BY' }, {
            'text': 'Belgium',
            'id': 'BE'
        }, { 'text': 'Belize', 'id': 'BZ' }, { 'text': 'Benin', 'id': 'BJ' }, {
            'text': 'Bermuda',
            'id': 'BM'
        }, { 'text': 'Bhutan', 'id': 'BT' }, { 'text': 'Bolivia', 'id': 'BO' }, {
            'text': 'Bosnia \\u0026 Herzegovina',
            'id': 'BA'
        }, { 'text': 'Botswana', 'id': 'BW' }, { 'text': 'Bouvet Island', 'id': 'BV' }, {
            'text': 'Brazil',
            'id': 'BR'
        }, { 'text': 'British Indian Ocean Territory', 'id': 'IO' }, {
            'text': 'British Virgin Islands',
            'id': 'VG'
        }, { 'text': 'Brunei', 'id': 'BN' }, { 'text': 'Bulgaria', 'id': 'BG' }, {
            'text': 'Burkina Faso',
            'id': 'BF'
        }, { 'text': 'Burundi', 'id': 'BI' }, { 'text': 'Cambodia', 'id': 'KH' }, {
            'text': 'Cameroon',
            'id': 'CM'
        }, { 'text': 'Canada', 'id': 'CA' }, { 'text': 'Cape Verde', 'id': 'CV' }, {
            'text': 'Caribbean Netherlands',
            'id': 'BQ'
        }, { 'text': 'Cayman Islands', 'id': 'KY' }, { 'text': 'Central African Republic', 'id': 'CF' }, {
            'text': 'Chad',
            'id': 'TD'
        }, { 'text': 'Chile', 'id': 'CL' }, { 'text': 'China', 'id': 'CN' }, {
            'text': 'Christmas Island',
            'id': 'CX'
        }, { 'text': 'Cocos (Keeling) Islands', 'id': 'CC' }, { 'text': 'Colombia', 'id': 'CO' }, {
            'text': 'Comoros',
            'id': 'KM'
        }, { 'text': 'Congo - Brazzaville', 'id': 'CG' }, {
            'text': 'Congo - Kinshasa',
            'id': 'CD'
        }, { 'text': 'Cook Islands', 'id': 'CK' }, {
            'text': 'Costa Rica',
            'id': 'CR'
        }, { 'text': 'C\xc3\xb4te d\\u2019Ivoire', 'id': 'CI' }, { 'text': 'Croatia', 'id': 'HR' }, {
            'text': 'Cuba',
            'id': 'CU'
        }, { 'text': 'Cura\xc3\xa7ao', 'id': 'CW' }, { 'text': 'Cyprus', 'id': 'CY' }, {
            'text': 'Czechia',
            'id': 'CZ'
        }, { 'text': 'Denmark', 'id': 'DK' }, { 'text': 'Djibouti', 'id': 'DJ' }, {
            'text': 'Dominica',
            'id': 'DM'
        }, { 'text': 'Dominican Republic', 'id': 'DO' }, { 'text': 'Ecuador', 'id': 'EC' }, {
            'text': 'Egypt',
            'id': 'EG'
        }, { 'text': 'El Salvador', 'id': 'SV' }, { 'text': 'Equatorial Guinea', 'id': 'GQ' }, {
            'text': 'Eritrea',
            'id': 'ER'
        }, { 'text': 'Estonia', 'id': 'EE' }, {
            'text': 'Ethiopia',
            'id': 'ET'
        }, { 'text': 'Falkland Islands (Islas Malvinas)', 'id': 'FK' }, {
            'text': 'Faroe Islands',
            'id': 'FO'
        }, { 'text': 'Fiji', 'id': 'FJ' }, { 'text': 'Finland', 'id': 'FI' }, {
            'text': 'France',
            'id': 'FR'
        }, { 'text': 'French Guiana', 'id': 'GF' }, {
            'text': 'French Polynesia',
            'id': 'PF'
        }, { 'text': 'French Southern Territories', 'id': 'TF' }, { 'text': 'Gabon', 'id': 'GA' }, {
            'text': 'Gambia',
            'id': 'GM'
        }, { 'text': 'Georgia', 'id': 'GE' }, { 'text': 'Germany', 'id': 'DE' }, {
            'text': 'Ghana',
            'id': 'GH'
        }, { 'text': 'Gibraltar', 'id': 'GI' }, { 'text': 'Greece', 'id': 'GR' }, {
            'text': 'Greenland',
            'id': 'GL'
        }, { 'text': 'Grenada', 'id': 'GD' }, { 'text': 'Guadeloupe', 'id': 'GP' }, {
            'text': 'Guam',
            'id': 'GU'
        }, { 'text': 'Guatemala', 'id': 'GT' }, { 'text': 'Guernsey', 'id': 'GG' }, {
            'text': 'Guinea',
            'id': 'GN'
        }, { 'text': 'Guinea-Bissau', 'id': 'GW' }, { 'text': 'Guyana', 'id': 'GY' }, {
            'text': 'Haiti',
            'id': 'HT'
        }, { 'text': 'Heard \\u0026 McDonald Islands', 'id': 'HM' }, {
            'text': 'Honduras',
            'id': 'HN'
        }, { 'text': 'Hong Kong', 'id': 'HK' }, { 'text': 'Hungary', 'id': 'HU' }, {
            'text': 'Iceland',
            'id': 'IS'
        }, { 'text': 'India', 'id': 'IN' }, { 'text': 'Indonesia', 'id': 'ID' }, {
            'text': 'Iran',
            'id': 'IR'
        }, { 'text': 'Iraq', 'id': 'IQ' }, { 'text': 'Ireland', 'id': 'IE' }, {
            'text': 'Isle of Man',
            'id': 'IM'
        }, { 'text': 'Israel', 'id': 'IL' }, { 'text': 'Italy', 'id': 'IT' }, {
            'text': 'Jamaica',
            'id': 'JM'
        }, { 'text': 'Japan', 'id': 'JP' }, { 'text': 'Jersey', 'id': 'JE' }, {
            'text': 'Jordan',
            'id': 'JO'
        }, { 'text': 'Kazakhstan', 'id': 'KZ' }, { 'text': 'Kenya', 'id': 'KE' }, {
            'text': 'Kiribati',
            'id': 'KI'
        }, { 'text': 'Kosovo', 'id': 'XK' }, { 'text': 'Kuwait', 'id': 'KW' }, {
            'text': 'Kyrgyzstan',
            'id': 'KG'
        }, { 'text': 'Laos', 'id': 'LA' }, { 'text': 'Latvia', 'id': 'LV' }, {
            'text': 'Lebanon',
            'id': 'LB'
        }, { 'text': 'Lesotho', 'id': 'LS' }, { 'text': 'Liberia', 'id': 'LR' }, {
            'text': 'Libya',
            'id': 'LY'
        }, { 'text': 'Liechtenstein', 'id': 'LI' }, { 'text': 'Lithuania', 'id': 'LT' }, {
            'text': 'Luxembourg',
            'id': 'LU'
        }, { 'text': 'Macau', 'id': 'MO' }, { 'text': 'Macedonia (FYROM)', 'id': 'MK' }, {
            'text': 'Madagascar',
            'id': 'MG'
        }, { 'text': 'Malawi', 'id': 'MW' }, { 'text': 'Malaysia', 'id': 'MY' }, {
            'text': 'Maldives',
            'id': 'MV'
        }, { 'text': 'Mali', 'id': 'ML' }, { 'text': 'Malta', 'id': 'MT' }, {
            'text': 'Marshall Islands',
            'id': 'MH'
        }, { 'text': 'Martinique', 'id': 'MQ' }, { 'text': 'Mauritania', 'id': 'MR' }, {
            'text': 'Mauritius',
            'id': 'MU'
        }, { 'text': 'Mayotte', 'id': 'YT' }, { 'text': 'Mexico', 'id': 'MX' }, {
            'text': 'Micronesia',
            'id': 'FM'
        }, { 'text': 'Moldova', 'id': 'MD' }, { 'text': 'Monaco', 'id': 'MC' }, {
            'text': 'Mongolia',
            'id': 'MN'
        }, { 'text': 'Montenegro', 'id': 'ME' }, { 'text': 'Montserrat', 'id': 'MS' }, {
            'text': 'Morocco',
            'id': 'MA'
        }, { 'text': 'Mozambique', 'id': 'MZ' }, { 'text': 'Myanmar (Burma)', 'id': 'MM' }, {
            'text': 'Namibia',
            'id': 'NA'
        }, { 'text': 'Nauru', 'id': 'NR' }, { 'text': 'Nepal', 'id': 'NP' }, {
            'text': 'Netherlands',
            'id': 'NL'
        }, { 'text': 'New Caledonia', 'id': 'NC' }, { 'text': 'New Zealand', 'id': 'NZ' }, {
            'text': 'Nicaragua',
            'id': 'NI'
        }, { 'text': 'Niger', 'id': 'NE' }, { 'text': 'Nigeria', 'id': 'NG' }, {
            'text': 'Niue',
            'id': 'NU'
        }, { 'text': 'Norfolk Island', 'id': 'NF' }, {
            'text': 'North Korea',
            'id': 'KP'
        }, { 'text': 'Northern Mariana Islands', 'id': 'MP' }, { 'text': 'Norway', 'id': 'NO' }, {
            'text': 'Oman',
            'id': 'OM'
        }, { 'text': 'Pakistan', 'id': 'PK' }, { 'text': 'Palau', 'id': 'PW' }, {
            'text': 'Palestine',
            'id': 'PS'
        }, { 'text': 'Panama', 'id': 'PA' }, { 'text': 'Papua New Guinea', 'id': 'PG' }, {
            'text': 'Paraguay',
            'id': 'PY'
        }, { 'text': 'Peru', 'id': 'PE' }, { 'text': 'Philippines', 'id': 'PH' }, {
            'text': 'Pitcairn Islands',
            'id': 'PN'
        }, { 'text': 'Poland', 'id': 'PL' }, { 'text': 'Portugal', 'id': 'PT' }, {
            'text': 'Puerto Rico',
            'id': 'PR'
        }, { 'text': 'Qatar', 'id': 'QA' }, { 'text': 'R\xc3\xa9union', 'id': 'RE' }, {
            'text': 'Romania',
            'id': 'RO'
        }, { 'text': 'Russia', 'id': 'RU' }, { 'text': 'Rwanda', 'id': 'RW' }, {
            'text': 'Samoa',
            'id': 'WS'
        }, { 'text': 'San Marino', 'id': 'SM' }, {
            'text': 'S\xc3\xa3o Tom\xc3\xa9 \\u0026 Pr\xc3\xadncipe',
            'id': 'ST'
        }, { 'text': 'Saudi Arabia', 'id': 'SA' }, { 'text': 'Senegal', 'id': 'SN' }, {
            'text': 'Serbia',
            'id': 'RS'
        }, { 'text': 'Seychelles', 'id': 'SC' }, { 'text': 'Sierra Leone', 'id': 'SL' }, {
            'text': 'Singapore',
            'id': 'SG'
        }, { 'text': 'Sint Maarten', 'id': 'SX' }, { 'text': 'Slovakia', 'id': 'SK' }, {
            'text': 'Slovenia',
            'id': 'SI'
        }, { 'text': 'Solomon Islands', 'id': 'SB' }, { 'text': 'Somalia', 'id': 'SO' }, {
            'text': 'South Africa',
            'id': 'ZA'
        }, { 'text': 'South Georgia \\u0026 South Sandwich Islands', 'id': 'GS' }, {
            'text': 'South Korea',
            'id': 'KR'
        }, { 'text': 'South Sudan', 'id': 'SS' }, { 'text': 'Spain', 'id': 'ES' }, {
            'text': 'Sri Lanka',
            'id': 'LK'
        }, { 'text': 'St. Barth\xc3\xa9lemy', 'id': 'BL' }, {
            'text': 'St. Helena',
            'id': 'SH'
        }, { 'text': 'St. Kitts \\u0026 Nevis', 'id': 'KN' }, { 'text': 'St. Lucia', 'id': 'LC' }, {
            'text': 'St. Martin',
            'id': 'MF'
        }, { 'text': 'St. Pierre \\u0026 Miquelon', 'id': 'PM' }, {
            'text': 'St. Vincent \\u0026 Grenadines',
            'id': 'VC'
        }, { 'text': 'Sudan', 'id': 'SD' }, { 'text': 'Suriname', 'id': 'SR' }, {
            'text': 'Svalbard \\u0026 Jan Mayen',
            'id': 'SJ'
        }, { 'text': 'Swaziland', 'id': 'SZ' }, { 'text': 'Sweden', 'id': 'SE' }, {
            'text': 'Switzerland',
            'id': 'CH'
        }, { 'text': 'Syria', 'id': 'SY' }, { 'text': 'Taiwan', 'id': 'TW' }, {
            'text': 'Tajikistan',
            'id': 'TJ'
        }, { 'text': 'Tanzania', 'id': 'TZ' }, { 'text': 'Thailand', 'id': 'TH' }, {
            'text': 'Timor-Leste',
            'id': 'TL'
        }, { 'text': 'Togo', 'id': 'TG' }, { 'text': 'Tokelau', 'id': 'TK' }, {
            'text': 'Tonga',
            'id': 'TO'
        }, { 'text': 'Trinidad \\u0026 Tobago', 'id': 'TT' }, { 'text': 'Tunisia', 'id': 'TN' }, {
            'text': 'Turkey',
            'id': 'TR'
        }, { 'text': 'Turkmenistan', 'id': 'TM' }, {
            'text': 'Turks \\u0026 Caicos Islands',
            'id': 'TC'
        }, { 'text': 'Tuvalu', 'id': 'TV' }, {
            'text': 'U.S. Outlying Islands',
            'id': 'UM'
        }, { 'text': 'U.S. Virgin Islands', 'id': 'VI' }, { 'text': 'Uganda', 'id': 'UG' }, {
            'text': 'Ukraine',
            'id': 'UA'
        }, { 'text': 'United Arab Emirates', 'id': 'AE' }, {
            'text': 'United Kingdom',
            'id': 'GB'
        }, { 'text': 'United States', 'id': 'US' }, { 'text': 'Uruguay', 'id': 'UY' }, {
            'text': 'Uzbekistan',
            'id': 'UZ'
        }, { 'text': 'Vanuatu', 'id': 'VU' }, { 'text': 'Vatican City', 'id': 'VA' }, {
            'text': 'Venezuela',
            'id': 'VE'
        }, { 'text': 'Vietnam', 'id': 'VN' }, { 'text': 'Wallis \\u0026 Futuna', 'id': 'WF' }, {
            'text': 'Western Sahara',
            'id': 'EH'
        }, { 'text': 'Yemen', 'id': 'YE' }, { 'text': 'Zambia', 'id': 'ZM' }, { 'text': 'Zimbabwe', 'id': 'ZW' }];
        $('.inlinepopup').find('.geo').select2({
            data: geo_data
        });

        let category_data = [{ 'text': 'All categories', 'id': '0' }, {
            'text': 'Arts & Entertainment',
            'id': '3'
        }, { 'text': 'Autos & Vehicles', 'id': '47' }, {
            'text': 'Beauty & Fitness',
            'id': '44'
        }, { 'text': 'Books & Literature', 'id': '22' }, {
            'text': 'Business & Industrial',
            'id': '12'
        }, { 'text': 'Computers & Electronics', 'id': '5' }, { 'text': 'Finance', 'id': '7' }, {
            'text': 'Food & Drink',
            'id': '71'
        }, { 'text': 'Games', 'id': '8' }, { 'text': 'Health', 'id': '45' }, {
            'text': 'Hobbies & Leisure',
            'id': '65'
        }, { 'text': 'Home & Garden', 'id': '11' }, {
            'text': 'Internet & Telecom',
            'id': '13'
        }, { 'text': 'Jobs & Education', 'id': '958' }, { 'text': 'Law & Government', 'id': '19' }, {
            'text': 'News',
            'id': '16'
        }, { 'text': 'Online Communities', 'id': '299' }, {
            'text': 'People & Society',
            'id': '14'
        }, { 'text': 'Pets & Animals', 'id': '66' }, { 'text': 'Real Estate', 'id': '29' }, {
            'text': 'Reference',
            'id': '533'
        }, { 'text': 'Science', 'id': '174' }, { 'text': 'Shopping', 'id': '18' }, {
            'text': 'Sports',
            'id': '20'
        }, { 'text': 'Travel', 'id': '67' }];
        $('.inlinepopup').find('.category').select2({
            data: category_data
        });
    }

    for (let k = 0; k < schema.length; k++) {
        buffer += "<li name='schema' data-jstree='" + def_val + "'>" + schema[k]["schema_name"] + "<ul>";
        let table_list = schema[k]["tables"];

        for (let i = 0; i < table_list.length; i++) {
            buffer += "<li name='table' data-jstree='" + def_val1 + "'>" + table_list[i]["table_name"] + "<ul>";
            let col_list = table_list[i]["columns"];
            let metadata_id_list = table_list[i]["metadata_id"];
            let selected_list;

            if (flow == "reconfigure_pipeline") {
                selected_list = table_list[i]["is_selected"];
            }

            for (let j = 0; j < col_list.length; j++) {
                let val = schema[k]["schema_name"] + "$$" + table_list[i]["table_name"] + "$$" + col_list[j] + "$$" + metadata_id_list[j];
                buffer += "<li name='columns' id='" + val + "' data-jstree='" + def_val2 + "'>" + col_list[j];
                if (global_app_type == "DA_DAMSK" || global_app_type == "DA_SYNDA") {
                    let local_buffer = '<div class="btn-group jstree-nested-radio"> \
                        <a class="btn font-green jstree-nested-modal" data-toggle="modal" href="#jstree-nested-modal"> \
                        <i class="fa fa-caret-down"></i></a></div>';
                    buffer += local_buffer + "</li>";
                }
                else {
                    buffer += "</li>";
                }

                if (flow == "reconfigure_pipeline" && selected_list[j]) {
                    selected.push(val);
                }
                else if (select_all == "true") {
                    selected.push(val);
                }
            }
            buffer += '</ul></li>';
        }
        buffer += '</ul></li>';
    }
    buffer += '</ul></li>';

    if (select_all == "true") {
        $(thisdiv).find('#mt-checkbox-list').html(buffer);
    }
    else {
        $('.inlinepopup').find('#mt-checkbox-list').html(buffer);
    }

    if (flow == "reconfigure_pipeline") {
        // debugger;
        let data_src = saturamPiperrApp.init("get_source_configuration");

        let int_data_src = [];
        if (data_src.src.length != 0) {

            for (let i = 0; i < data_src.src.length; i++) {
                let srcElement = data_src.src[i];
                if (srcElement.int_id == int_id) {
                    int_data_src = srcElement.selected_col;
                }
            }
        }
        if (int_data_src.length != 0) {
            $('.inlinepopup').find('div[name="data-treeview"]').on('loaded.jstree', treeLoaded).jstree({
                "checkbox": {
                    "keep_selected_style": false
                },
                "types": {
                    "schema": {
                        "icon": "glyphicon glyphicon-gift"
                    },
                    "tables": {
                        "icon": "glyphicon glyphicon-text-width"
                    },
                    "columns": {
                        "icon": "glyphicon glyphicon-minus"
                    }
                },
                "plugins": ["checkbox", "types"]
            });

            function treeLoaded(event, data) {
                data.instance.select_node(int_data_src); //node ids that you want to check
            }
        }
        else {
            // debugger;
            $('.inlinepopup').find('div[name="data-treeview"]').on('loaded.jstree', treeLoaded).jstree({
                "checkbox": {
                    "keep_selected_style": false
                },
                "types": {
                    "schema": {
                        "icon": "glyphicon glyphicon-gift"
                    },
                    "tables": {
                        "icon": "glyphicon glyphicon-text-width"
                    },
                    "columns": {
                        "icon": "glyphicon glyphicon-minus"
                    }
                },
                "plugins": ["checkbox", "types"]
            });

            function treeLoaded(event, data) {
                data.instance.select_node(selected); //node ids that you want to check
            }
        }
    }
    else if (flow == "create_pipeline") {
        // debugger;
        let data_src = saturamPiperrApp.init("get_source_configuration");

        let int_data_src = [];
        if (data_src.src.length != 0) {

            for (let i = 0; i < data_src.src.length; i++) {
                let srcElement = data_src.src[i];
                if (srcElement.int_id == int_id) {
                    int_data_src = srcElement.selected_col;
                }
            }
        }
        if (int_data_src.length != 0) {
            $('.inlinepopup').find('div[name="data-treeview"]').on('loaded.jstree', treeLoaded).jstree({
                "checkbox": {
                    "keep_selected_style": false
                },
                "types": {
                    "schema": {
                        "icon": "glyphicon glyphicon-gift"
                    },
                    "tables": {
                        "icon": "glyphicon glyphicon-text-width"
                    },
                    "columns": {
                        "icon": "glyphicon glyphicon-minus"
                    }
                },
                "plugins": ["checkbox", "types"]
            });

            function treeLoaded(event, data) {
                data.instance.select_node(int_data_src); //node ids that you want to check
            }

        }
        else {
            // debugger;
            if (select_all == "true") {
                $(thisdiv).find('div[name="data-treeview"]').jstree({
                    "checkbox": {
                        "keep_selected_style": false,
                        "three_state": true,       // allows automatic parent-child selection
                        "cascade": "down"
                    },
                    "types": {
                        "schema": {
                            "icon": "glyphicon glyphicon-gift"
                        },
                        "tables": {
                            "icon": "glyphicon glyphicon-text-width"
                        },
                        "columns": {
                            "icon": "glyphicon glyphicon-minus"
                        }
                    },
                    "plugins": ["checkbox", "types"]
                });
                // drawEditableTree(thisdiv, select_all);
                let treeUpdateTimer;
                $('.inlinepopup').find('div[name="data-treeview"]').on('changed.jstree', function () {
                    // debugger;
                    clearTimeout(treeUpdateTimer);
                    treeUpdateTimer = setTimeout(() => {
                        drawEditableTree($('.inlinepopup'), "false");
                    }, 200); // Give time for selection updates to finalize
                });

            }
            else {
                $('.inlinepopup').find('div[name="data-treeview"]').jstree({
                    "checkbox": {
                        "keep_selected_style": false
                    },
                    "types": {
                        "schema": {
                            "icon": "glyphicon glyphicon-gift"
                        },
                        "tables": {
                            "icon": "glyphicon glyphicon-text-width"
                        },
                        "columns": {
                            "icon": "glyphicon glyphicon-minus"
                        }
                    },
                    "plugins": ["checkbox", "types"]
                });

                // $('.inlinepopup').find('div[name="data-treeview"]').on("select_node.jstree", function (e, data) {
                //     selected_node = data.node.id;
                // });
                $('.inlinepopup').find('div[name="data-treeview"]').on("select_node.jstree", function (e, data) {
                    let tree = $(this).jstree(true);
                    let node = data.node;

                    // If user clicks on a schema or table, open and select all children
                    if (node.type === "schema" || node.type === "tables") {
                        tree.open_node(node); // ensure children are loaded
                        tree.check_node(node.children_d); // recursively select all children
                    }
                });

            }
        }
    }
}

function storeSelectedNodeConfig() {
    $("input:radio[name='test']").each(function (i) {
        if (this.checked == true) {
            selected_node_key_value[selected_node] = this.id;
        }
    });
    $('#jstree-nested-modal').modal('toggle');
}

function drawS3TreeStructure(json, flow, int_id, int_type, thisdiv, select_all = false) {
    let selected = [];
    let treeData = [];

    if (!json || !json.data || json.data.length === 0) {
        $('.inlinepopup').find('#mt-checkbox-list').html('<p>No files or buckets found.</p>');
        return;
    }

    json.data.forEach((bucket, bIndex) => {
        const bucketId = `bucket_${bIndex}`;
        treeData.push({
            id: bucketId,
            parent: "#",
            text: bucket.bucket_name,
            type: "schema",
            state: { opened: true }
        });

        bucket.folders.forEach((folder, fIndex) => {
            const folderId = `folder_${bIndex}_${fIndex}`;
            const folderName = folder.folder_name || `Folder ${fIndex + 1}`;

            treeData.push({
                id: folderId,
                parent: bucketId,
                text: folderName,
                type: "folder",
                state: { opened: true }
            });

            folder.files.forEach((file, fileIndex) => {
                const fileId = `file_${bIndex}_${fIndex}_${fileIndex}`;
                const shouldSelect = select_all === true;

                treeData.push({
                    id: fileId,
                    parent: folderId,
                    text: file.file_name,
                    type: "columns",
                    data: {
                        file_name: file.file_name || '',
                        file_path: file.file_path || '',
                        metadata_id: file.metadata_id || ''
                    },
                    state: {
                        selected: shouldSelect
                    }
                });

                if (shouldSelect) {
                    selected.push(fileId);
                }
            });
        });
    });

    // Render tree and selected files section
    $('.inlinepopup').find('#mt-checkbox-list').html(`
        <div name="data-treeview"></div>
        <div id="selected-files-list" style="margin-top: 15px;"></div>
    `);

    let $treeView = $('.inlinepopup').find('div[name="data-treeview"]');
    $treeView.jstree("destroy").empty();

    $treeView.jstree({
        core: {
            data: treeData,
            themes: { icons: true }
        },
        checkbox: {
            keep_selected_style: false,
            three_state: true,
            cascade: 'up+down'
        },
        types: {
            "schema": { "icon": "glyphicon glyphicon-hdd" },
            "folder": { "icon": "glyphicon glyphicon-folder-close" },
            "columns": { "icon": "glyphicon glyphicon-file" }
        },
        plugins: ["checkbox", "types"]
    });

    // Pre-select nodes if needed
    $treeView.on('loaded.jstree', function (e, data) {
        if (select_all === true && selected.length > 0) {
            data.instance.select_node(selected);
        }
    });

    // Render only file names below on selection
    $treeView.on('changed.jstree', function (e, data) {
        let selected_nodes = data.selected
            .map(id => data.instance.get_node(id))
            .filter(node => node && node.type === 'columns');

        if (selected_nodes.length > 0) {
            let html = '<ul>';
            selected_nodes.forEach((node) => {
                html += `<li>${node.text}</li>`;
            });
            html += '</ul>';
            $('.inlinepopup').find('#selected-files-list').html(html);
        } else {
            $('.inlinepopup').find('#selected-files-list').empty();
        }
    });
}

function getMetaDataStructure(thisdiv, select_all) {
    // debugger;
    $('button[name=save_integration]').prop("disabled", true);
    if (typeof select_all === "undefined" || select_all === null) {
        select_all = "false";
    }

    let _t_id = $(thisdiv).find('input[name="integration_id"]').val();


    $(thisdiv).find('input[name="integration_id"]').attr("value", _t_id);

    $('.inlinepopup').find('#mt-checkbox-list').empty();

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    if (sPageURL.split('&')[1]) {
        let p_id_key = sPageURL.split('&')[1];
        let p_id = p_id_key.split('=')[1];
        let int_type = $(thisdiv).find('input[name="integration_type"]').val();


        $.getJSON(window.location.protocol + '//' + window.location.host + "/get_filter_params?integration_id=" + _t_id + "&pipeline_id=" + p_id, function (json) {
            if (json.data.length != 0) {
                let json_data = JSON.parse(json.data[0].ui_filterparam);
                let search_user = json_data.search_user;
                let search_term = json_data.search_term;
                let others = json_data.others;
                if (int_type == "twitter") {
                    $('.inlinepopup').find('#search_user').attr("value", search_user);
                    $('.inlinepopup').find('#search_term').attr("value", search_term);
                }
                else if (int_type == "facebook") {
                    $('.inlinepopup').find('#search_page').attr("value", search_user);
                }
                else if (int_type == "googletrends") {
                    let data2 = [];
                    $('.inlinepopup').find('.geo').select2({
                        data: data2
                    });
                    $('.inlinepopup').find('.category').select2({
                        data: data2
                    });

                    $('.inlinepopup').find('#keywords').attr("value", search_term);
                    let params = others.split('$$$');
                    $('.inlinepopup').find('.geo').val(params[0]).trigger('change.select2');
                    $('.inlinepopup').find('#timeframe').val(params[1]);
                    $('.inlinepopup').find('.category').val(params[2]).trigger('change.select2');
                }
            }
        });

        $.getJSON(window.location.protocol + '//' + window.location.host + "/integration/structure?integration_id=" + _t_id + "&pipeline_id=" + p_id, function (json) {
            drawTreeStructure(json, "reconfigure_pipeline", _t_id, int_type, thisdiv, select_all);
        });
    }
    else {
        let int_type = $(thisdiv).find('input[name="integration_type"]').val();
        console.log("int_type",int_type)
        if (int_type === "s3") {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/integration/structure?integration_id=" + _t_id, function (json) {
                drawS3TreeStructure(json, "create_pipeline", _t_id, int_type, thisdiv, select_all);
            });}
        else {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/integration/structure?integration_id=" + _t_id, function (json) {
                drawTreeStructure(json, "create_pipeline", _t_id, int_type, thisdiv, select_all);
            });
        }
    }
}


function drawEditableTree(thisdiv, select_all) {
    // debugger;
    if (typeof select_all === "undefined" || select_all === null) {
        select_all = "false";
    }
    let col_value = [];
    let def_val = '{"type":"schema"}';
    let def_val1 = '{"type":"tables"}';
    let def_val2 = '{"type":"columns"}';
    let def_val3 = '{"type":"rules"}';
    if (select_all == "true") {
        col_value = $(thisdiv).find('div[name="data-treeview"]').jstree("get_selected");
        col_value.splice(-1, 1);
        col_value.splice(-1, 1);
    }
    else {
        // $('a.jstree-clicked').each(function () {
        //     debugger;
        //     if (this.parentNode.getAttribute('name') == 'columns') {
        //         col_value.push(this.parentNode.id);
        //     }
        // });
        // $('.inlinepopup').find('div[name="data-treeview"]').jstree(true).get_checked(true).forEach(function (node) {
        //     if (node.original && node.original.type === "columns") {
        //         col_value.push(node.id);
        //     }
        // }); 
        // let checked = $('.inlinepopup').find('div[name="data-treeview"]').jstree(true).get_checked(true);
        let tree = $('.inlinepopup').find('div[name="data-treeview"]').jstree(true);
        let checked = tree.get_checked(true); // Get all checked nodes with full data
        // let unchecked = tree.get_checked(false);

        console.log("Checked nodes:", checked); // this should list checked nodes

        checked.forEach(function (node) {
            if ((node.original?.type || node.type) === "columns") {
                col_value.push(node.id);
                // tree.uncheck_node(node);
            }
        });
        $(thisdiv).find('div[name="data-treeview"]').on('ready.jstree', function () {
            let tree = $(this).jstree(true);

            col_value.forEach(function (id) {
                tree.check_node(id); // Re-check previously stored column nodes
            });
        });

    }

    let schema = "";
    let table = "";
    let column = "";
    let buffer = "";
    let schema_change = "";
    let table_change = "";
    let schema_list = [];
    let table_list = [];

    console.log("**************************************  DATA");
    for (let i = 0; i < col_value.length; i++) {
        let config_exits = selected_node_key_value[col_value[i]];

        let data = col_value[i].split('$$');


        if (data[0] != schema) {
            schema_change = "1";
            if (i != "0") {
                buffer += '</ul></li></ul></li>';
            }
            buffer += "<li name='schema' data-jstree='" + def_val + "'>" + data[0] + "<ul>";
        }
        if (data[1] != table || schema_change == "1") {
            table_change = "1";
            if (i != "0" && schema_change == "0") {
                buffer += '</ul></li>';
            }
            buffer += "<li name='table' data-jstree='" + def_val1 + "'>" + data[1] + "<ul>";
            schema_change = "0";
        }
        if (data[2] != column || table_change == "1") {
            buffer += "<li name='columns' id='" + col_value[i] + "' data-jstree='" + def_val2 + "'>" + data[2];
            if (typeof (config_exits) != "undefined") {
                buffer += "<ul><li name='rules' id='" + config_exits + "' data-jstree='" + def_val3 + "'>" + config_exits + "</li></ul>";
            }
            buffer += "</li>";
            table_change = "0";
        }
        schema = data[0];
        table = data[1];
        column = data[2];

        schema_list.push(schema);

        table_list.push(table);


    }
    console.log("**************************************  DATA");
    console.log(schema_list);
    console.log(table_list);

    localStorage.setItem("schema_list", schema_list.filter((v, i, a) => a.indexOf(v) === i));
    localStorage.setItem("table_list", table_list.filter((v, i, a) => a.indexOf(v) === i));



    buffer += '</ul></li></ul></li>';
    if (select_all == "true") {
        $(thisdiv).find('#mt-checkbox-list-1').html(buffer);
        $(thisdiv).find('div[name="data-treeview-1"]').jstree(
            {
                "core": { "check_callback": true },
                "types": {
                    "schema": {
                        "icon": "glyphicon glyphicon-gift"
                    },
                    "tables": {
                        "icon": "glyphicon glyphicon-text-width"
                    },
                    "columns": {
                        "icon": "glyphicon glyphicon-minus"

                    }
                },
                "plugins": ["types"]
            });

        saturamPiperrApp.select_all_save_source(thisdiv);
    }
    else {
        $('.inlinepopup').find('#mt-checkbox-list-1').html(buffer);

        $('.inlinepopup').find('div[name="data-treeview-1"]').jstree(
            {
                "core": { "check_callback": true },
                "types": {
                    "schema": {
                        "icon": "glyphicon glyphicon-gift"
                    },
                    "tables": {
                        "icon": "glyphicon glyphicon-text-width"
                    },
                    "columns": {
                        "icon": "glyphicon glyphicon-minus"
                    },
                    "rules": {
                        "icon": "glyphicon glyphicon-minus"

                    }
                },
                "plugins": ["types"]
            });

        $('.inlinepopup').find('div[name="data-treeview-1"]').on('ready.jstree', function () {
            $('.inlinepopup').find('div[name="data-treeview-1"]').jstree("open_all");
        });

        $('.inlinepopup').find('div[name="data-treeview-1"]').bind("dblclick.jstree", function (event) {
            let ref = $('.inlinepopup').find('div[name="data-treeview-1"]').jstree(true),
                sel = ref.get_selected();
            if (!sel.length) {
                return false;
            }
            sel = sel[0];
            ref.edit(sel);
        });
    }
}


